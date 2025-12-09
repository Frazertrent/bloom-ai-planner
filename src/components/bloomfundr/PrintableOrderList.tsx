import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, Square } from "lucide-react";
import type { BFOrderWithRelations } from "@/types/bloomfundr";

interface PrintableOrderListProps {
  orders: BFOrderWithRelations[];
  campaignName?: string;
}

interface ProductGroup {
  productName: string;
  category: string;
  items: {
    orderNumber: string;
    quantity: number;
    color?: string;
    ribbonColor?: string;
    recipientName?: string;
    specialInstructions?: string;
  }[];
}

export function PrintableOrderList({ orders, campaignName }: PrintableOrderListProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Group items by product
  const productGroups: ProductGroup[] = [];
  const productMap = new Map<string, ProductGroup>();

  orders.forEach((order) => {
    order.order_items?.forEach((item) => {
      const productName = item.campaign_product?.product?.name || "Unknown Product";
      const category = item.campaign_product?.product?.category || "other";
      const key = `${productName}-${category}`;

      if (!productMap.has(key)) {
        productMap.set(key, {
          productName,
          category,
          items: [],
        });
      }

      productMap.get(key)?.items.push({
        orderNumber: order.order_number,
        quantity: item.quantity,
        color: item.customizations?.color,
        ribbonColor: item.customizations?.ribbon_color,
        recipientName: item.recipient_name || undefined,
        specialInstructions: item.customizations?.special_instructions,
      });
    });
  });

  productMap.forEach((group) => productGroups.push(group));
  productGroups.sort((a, b) => a.category.localeCompare(b.category));

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Production List${campaignName ? ` - ${campaignName}` : ""}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 4px; }
            .subtitle { color: #666; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: 600; }
            .checkbox { width: 24px; text-align: center; }
            .checkbox-box { display: inline-block; width: 16px; height: 16px; border: 2px solid #000; }
            .customization { font-size: 12px; color: #666; }
            @media print {
              body { padding: 0; }
              h2 { page-break-before: auto; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const totalItems = productGroups.reduce((sum, g) => 
    sum + g.items.reduce((s, i) => s + i.quantity, 0), 0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Production List
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Production List Preview</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <div ref={printRef} className="bg-white text-black p-4">
          <h1>Production List</h1>
          <p className="subtitle">
            {campaignName && `${campaignName} • `}
            {orders.length} orders • {totalItems} total items • 
            {new Date().toLocaleDateString()}
          </p>

          {productGroups.map((group, idx) => (
            <div key={idx}>
              <h2 className="capitalize">{group.category}s: {group.productName}</h2>
              <table>
                <thead>
                  <tr>
                    <th className="checkbox">✓</th>
                    <th>Order #</th>
                    <th>Qty</th>
                    <th>Color</th>
                    <th>Ribbon</th>
                    <th>Recipient</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item, itemIdx) => (
                    <tr key={itemIdx}>
                      <td className="checkbox">
                        <Square className="h-4 w-4 inline-block" strokeWidth={2} />
                      </td>
                      <td>{item.orderNumber}</td>
                      <td>{item.quantity}</td>
                      <td>{item.color || "—"}</td>
                      <td>{item.ribbonColor || "—"}</td>
                      <td>{item.recipientName || "—"}</td>
                      <td className="customization">{item.specialInstructions || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {productGroups.length === 0 && (
            <p>No items to display</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
