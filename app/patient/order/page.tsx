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
import { Orders, GetOrderRes } from "@/lib/api/orders"
import { Inventory, ProductEntity } from "@/lib/api/inventory"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Payments } from "@/lib/api/payments"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

type OrderStatus = "pay" | "prepare" | "completed"


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

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  // Map backend status → tab
const mapStatus = (status: string): OrderStatus => {
  switch (status.toUpperCase()) {
    case "PENDING":
    case "RESERVED":
    case "PAYMENT_PENDING":
    case "REJECTED":
      return "pay"

    case "DELIVERY_PENDING":
      return "prepare"

    case "DELIVERED":
    case "COMPLETED":
      return "completed"

    default:
      return "pay"
  }
}


  // Fetch orders and enrich product data
  const fetchAndEnrichOrders = async () => {
    const res = await Orders.getMyOrders()
    const orderData = res.data || []

    const enrichedOrders: DetailedOrder[] = await Promise.all(
      orderData.map(async (order: DetailedOrder) => {
        const ids = order.order_items.map((i) => i.product_id).join(",")
        if (!ids) return order
        try {
          const productRes = await Inventory.getProducts(ids)
          const productMap: Record<number, ProductEntity> = {}
          productRes.data.forEach((p: ProductEntity) => (productMap[p.id] = p))
          const detailedItems = order.order_items.map((item) => ({
            ...item,
            product: productMap[item.product_id],
          }))
          return { ...order, order_items: detailedItems }
        } catch {
          return order
        }
      })
    )

    setOrders(enrichedOrders)
  }

  useEffect(() => {
    (async () => {
      try {
        await fetchAndEnrichOrders()
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err)
        toast.error("โหลดคำสั่งซื้อไม่สำเร็จ")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filteredOrders = orders.filter(
    (o) => mapStatus(o.order.status) === activeTab
  )

  const handleOpenPayment = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowPaymentModal(true)
  }

  // Reserved → Payment Pending
  async function handleReservedToPaymentPending(orderId: number) {
    console.log("🧾 Converting RESERVED → PAYMENT_PENDING for order:", orderId)
    try {
      setIsPaying(true)
      const createRes = await Payments.createPayment(orderId, "qr_payment")
      console.log("✅ createPayment response:", createRes)
      toast.success("อัพเดทสถานะเป็น Payment Pending แล้ว ✅")
      await fetchAndEnrichOrders()
    } catch (err: any) {
      console.error("❌ Reserved→PaymentPending error", err.response?.data || err)
      toast.error("ไม่สามารถอัพเดทสถานะเป็น Payment Pending ได้")
    } finally {
      setIsPaying(false)
    }
  }

  // Payment Pending → Delivery Pending
const handleConfirmPayment = async () => {
  if (!selectedOrderId) return
  setIsPaying(true)

  try {
    // 1) สร้าง payment (ใช้ qr_payment)
    const paymentRes = await Orders.createPayment(selectedOrderId, "qr_payment")

    // ✅ ปลอดภัย: extract id ด้วย type narrowing
    const paymentObj = paymentRes?.data?.payment as
      | { id?: number | string }
      | undefined
    const paymentId = paymentObj?.id

    if (!paymentId) throw new Error("Missing payment id")

    // 2) mock pay (ไม่มี body) + แปลงเป็น string
    await Orders.mockPay(paymentId.toString())

    // 3) โหลดรายการใหม่
    await fetchAndEnrichOrders()
    setActiveTab("prepare")

    // ✅ ใช้ react-toastify (ไม่ใช่ shadcn)
    toast.success(`✅ ชำระเงินสำเร็จ! คำสั่งซื้อ #${selectedOrderId} กำลังเตรียมการจัดส่ง`, {
      position: "top-right",
      autoClose: 2500,
    })

    setShowPaymentModal(false)
    setSelectedOrderId(null)
  } catch (err) {
    console.error("❌ Payment failed:", err)
    toast.error("❌ เกิดข้อผิดพลาดในการชำระเงิน โปรดลองอีกครั้ง", {
      position: "top-right",
      autoClose: 2500,
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

              {/* Orders */}
              {loading ? (
                <p className="text-center text-gray-500">กำลังโหลด...</p>
              ) : filteredOrders.length === 0 ? (
                <p className="text-center text-gray-500">ไม่มีคำสั่งซื้อในหมวดนี้</p>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((o) => {
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
<p className="text-sm">
  <span className="font-semibold">สถานะระบบ:</span>{" "}
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide
      ${
        o.order.status === "PENDING"
          ? "bg-yellow-100 text-yellow-800"
          : o.order.status === "RESERVED"
          ? "bg-blue-100 text-blue-800"
          : o.order.status === "PAYMENT_PENDING"
          ? "bg-orange-100 text-orange-800"
          : o.order.status === "DELIVERY_PENDING"
          ? "bg-green-100 text-green-800"
          : o.order.status === "DELIVERED"
          ? "bg-cyan-100 text-cyan-800"
          : o.order.status === "COMPLETED"
          ? "bg-gray-100 text-gray-800"
          : o.order.status === "REJECTED"
          ? "bg-red-100 text-red-800"
          : "bg-gray-200 text-gray-700"
      }`}
  >
    {o.order.status}
  </span>
</p>

                          </div>

                          {/* Order items */}
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

                            <div className="flex justify-between border-t pt-2 text-sm">
                              <span>VAT (7%)</span>
                              <span>{vat.toFixed(2)} บาท</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                              <span>รวมทั้งสิ้น</span>
                              <span>{grandTotal.toFixed(2)} บาท</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between border-t pt-4">
                            {o.order.status === "RESERVED" && (
                              <div className="flex justify-end w-full">
                                <Button
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleReservedToPaymentPending(o.order.id)}
                                  disabled={isPaying}
                                >
                                  {isPaying ? "กำลังยืนยัน..." : "ยืนยันการชำระเงิน"}
                                </Button>
                              </div>
                            )}

                            {o.order.status === "PAYMENT_PENDING" && (
                              <div className="flex justify-end w-full">
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleOpenPayment(o.order.id)}
                                >
                                  ชำระด้วย PromptPay
                                </Button>
                              </div>
                            )}

                            {o.order.status === "DELIVERY_PENDING" && (
                              <p className="text-sm text-green-600">กำลังเตรียมการ...</p>
                            )}
                            {o.order.status === "COMPLETED" && (
                              <p className="text-sm text-gray-600">จัดส่งสำเร็จ</p>
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

        {/* Payment Modal */}
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
  onClick={handleConfirmPayment} // ✅ ไม่ต้องส่งอะไร
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
