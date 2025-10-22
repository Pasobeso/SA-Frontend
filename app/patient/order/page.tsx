"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Orders, GetOrderRes } from "@/lib/api/orders"
import { Inventory, ProductEntity } from "@/lib/api/inventory"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type OrderStatus = "pay" | "prepare" | "send" | "completed"

interface DetailedOrderItem {
  product_id: number
  quantity: number
  product?: ProductEntity
}

interface DetailedOrder extends GetOrderRes {
  order_items: DetailedOrderItem[]
}

export default function MedicineOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("pay")
  const [orders, setOrders] = useState<DetailedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await Orders.getMyOrders()
        const orderData = res.data || []

        const enrichedOrders: DetailedOrder[] = await Promise.all(
          orderData.map(async (order) => {
            const ids = order.order_items.map((i) => i.product_id).join(",")
            if (!ids) return order

            try {
              const productRes = await Inventory.getProducts(ids)
              const productMap: Record<number, ProductEntity> = {}
              productRes.data.forEach((p) => (productMap[p.id] = p))

              const detailedItems: DetailedOrderItem[] = order.order_items.map(
                (item) => ({
                  ...item,
                  product: productMap[item.product_id],
                })
              )

              return { ...order, order_items: detailedItems }
            } catch {
              return order
            }
          })
        )

        setOrders(enrichedOrders)
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err)
        toast({
          title: "โหลดคำสั่งซื้อไม่สำเร็จ",
          description: "โปรดลองอีกครั้งในภายหลัง",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

// 🔹 Map backend status → frontend tab
const mapStatus = (status: string): OrderStatus => {
  switch (status.toUpperCase()) {
    case "WAITING_PAYMENT":
    case "PENDING":
    case "REJECTED": // ✅ add this line
      return "pay"
    case "PREPARING":
      return "prepare"
    case "SHIPPING":
      return "send"
    case "COMPLETED":
      return "completed"
    default:
      return "prepare"
  }
}


  const filteredOrders = orders.filter(
    (o) => mapStatus(o.order.status) === activeTab
  )

  const handleOpenPayment = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowPaymentModal(true)
  }

  const handleConfirmPayment = async () => {
    if (!selectedOrderId) return
    setIsPaying(true)

    try {
      const paymentRes = await Orders.createPayment(selectedOrderId, "promptpay")
      const paymentId = paymentRes.data.payment.id
      await Orders.mockPay(paymentId)

      setOrders((prev) =>
        prev.map((o) =>
          o.order.id === selectedOrderId
            ? { ...o, order: { ...o.order, status: "preparing" } }
            : o
        )
      )

      toast({
        title: "✅ ชำระเงินสำเร็จ!",
        description: `คำสั่งซื้อ #${selectedOrderId} ได้รับการชำระเงินเรียบร้อยแล้ว`,
      })

      setShowPaymentModal(false)
    } catch (err) {
      console.error("❌ Payment failed:", err)
      toast({
        title: "เกิดข้อผิดพลาดในการชำระเงิน",
        description: "โปรดลองอีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative flex-1 p-4 md:p-8">
          <SidebarTrigger />
          <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
              <h1 className="mb-8 text-4xl font-bold text-gray-900">
                รายการสั่งยา
              </h1>

              {/* Tabs */}
              <div className="mb-6 flex gap-2">
                {[
                  { key: "pay", label: "ที่ต้องชำระ" },
                  { key: "prepare", label: "กำลังเตรียมการ" },
                  { key: "send", label: "ที่ต้องได้รับ" },
                  { key: "completed", label: "สำเร็จ" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as OrderStatus)}
                    className={`rounded-lg px-6 py-3 font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {loading ? (
                <p className="text-center text-gray-500">กำลังโหลด...</p>
              ) : filteredOrders.length === 0 ? (
                <p className="text-center text-gray-500">
                  ไม่มีคำสั่งซื้อในหมวดนี้
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((o) => {
                    // ✅ Calculate subtotal and VAT per order
                    const subtotal = o.order_items.reduce((sum, item) => {
                      const price = item.product?.unit_price ?? 0
                      return sum + price * item.quantity
                    }, 0)
                    const vat = subtotal * 0.07
                    const grandTotal = subtotal + vat

                    return (
                      <Card
                        key={o.order.id}
                        className="bg-white p-6 shadow-sm border border-gray-200"
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-semibold">
                                หมายเลขคำสั่งซื้อ
                              </span>{" "}
                              {o.order.id}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">วันที่สั่งซื้อ</span>{" "}
                              {new Date(o.order.created_at).toLocaleString("th-TH")}
                            </p>
                          </div>

                          {/* Items */}
                          <div className="space-y-2 border-t pt-4">
                            {o.order_items.map((item, idx) => {
                              const product = item.product
                              const price = product?.unit_price ?? 0
                              const subtotalItem = price * item.quantity
                              return (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    {product
                                      ? `${product.th_name} (${product.en_name})`
                                      : `สินค้า #${item.product_id}`}
                                  </span>
                                  <span>
                                    {item.quantity} ชิ้น{" "}
                                    {product && (
                                      <span className="text-gray-500">
                                        ({price} บาท/ชิ้น = {subtotalItem.toFixed(2)} บาท)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )
                            })}

                            {/* ✅ VAT + Total */}
                            <div className="flex justify-between border-t pt-2 text-sm">
                              <span>VAT (7%)</span>
                              <span>{vat.toFixed(2)} บาท</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                              <span>รวมทั้งสิ้น</span>
                              <span>{grandTotal.toFixed(2)} บาท</span>
                            </div>
                          </div>

                          {/* Status / Action */}
                          <div className="flex items-center justify-between border-t pt-4">
{mapStatus(o.order.status) === "pay" && (
  <div className="flex justify-end w-full">
    <Button
      className="bg-green-600 hover:bg-green-700"
      onClick={() => handleOpenPayment(o.order.id)}
    >
      ชำระด้วย PromptPay
    </Button>
  </div>
)}

                            {mapStatus(o.order.status) === "prepare" && (
                              <p className="text-sm text-green-600">
                                กำลังเตรียมการ...
                              </p>
                            )}

                            {mapStatus(o.order.status) === "send" && (
                              <p className="text-sm text-blue-600">
                                อยู่ระหว่างการจัดส่ง
                              </p>
                            )}

                            {mapStatus(o.order.status) === "completed" && (
                              <p className="text-sm text-gray-600">
                                จัดส่งสำเร็จ
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <DialogTitle>ชำระเงินด้วย PromptPay</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center space-y-4">
              <Image
                src="/image1.png"
                alt="PromptPay QR"
                width={250}
                height={250}
                className="rounded-md border"
              />
              <p className="text-gray-600 text-sm">
                สแกน QR Code เพื่อชำระเงินผ่าน PromptPay
              </p>
            </div>

            <DialogFooter className="mt-6">
              <Button
                className="bg-green-600 hover:bg-green-700 w-full"
                onClick={handleConfirmPayment}
                disabled={isPaying}
              >
                {isPaying ? "กำลังยืนยัน..." : "ยืนยันการชำระเงิน"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
