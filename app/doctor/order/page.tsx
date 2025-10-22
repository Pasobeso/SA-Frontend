"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-docsidebar"
import { Orders, GetOrderRes } from "@/lib/api/orders"
import { Inventory, ProductEntity } from "@/lib/api/inventory"
import { Deliveries } from "@/lib/api/deliveries"
import { toast } from "react-toastify"

// ✅ Simplified types for doctor view
type OrderStatus = "prepare" | "completed"

interface DetailedOrderItem {
  product_id: number
  quantity: number
  product?: ProductEntity
}

interface DetailedOrder extends GetOrderRes {
  order_items: DetailedOrderItem[]
}

export default function DoctorOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("prepare")
  const [orders, setOrders] = useState<DetailedOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await Orders.getAllOrders()
        const data = res.data || []

        const enriched: DetailedOrder[] = await Promise.all(
          data.map(async (order) => {
            const ids = order.order_items.map((i) => i.product_id).join(",")
            if (!ids) return order as DetailedOrder

            try {
              const inv = await Inventory.getProducts(ids)
              const map: Record<number, ProductEntity> = {}
              inv.data.forEach((p) => (map[p.id] = p))

              const detailedItems: DetailedOrderItem[] = order.order_items.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                product: map[item.product_id],
              }))

              return { ...order, order_items: detailedItems }
            } catch {
              return order as DetailedOrder
            }
          })
        )

        setOrders(enriched)
      } catch (err) {
        console.error("❌ Failed to fetch doctor orders:", err)
        toast.error("โหลดคำสั่งซื้อไม่สำเร็จ โปรดลองอีกครั้งภายหลัง", {
          position: "top-right",
          autoClose: 2500,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // ✅ Map backend status → tab
  const mapStatus = (status: string): OrderStatus => {
    switch (status.toUpperCase()) {
      case "DELIVERY_PENDING":
        return "prepare"
      case "DELIVERED":
        return "completed"
      default:
        return "prepare"
    }
  }

  const filteredOrders = orders.filter(
    (o) => mapStatus(o.order.status) === activeTab
  )

  // ✅ เตรียมการสำเร็จ → PATCH /deliveries/{id}
  const handleMarkPrepared = async (id: number ,delivery_id: string) => {
    try {
      await Deliveries.updateStatus(delivery_id, "DELIVERED")
      setOrders((prev) =>
        prev.map((o) =>
          o.order.id === id ? { ...o, order: { ...o.order, status: "DELIVERED" } } : o
        )
      )
      toast.success(`✅ ยืนยันการจัดส่งสำเร็จ (Order #${id})`, {
        position: "top-right",
        autoClose: 2500,
      })
    } catch (err) {
      console.error("❌ Failed to update delivery:", err)
      toast.error("ไม่สามารถอัปเดตสถานะได้", {
        position: "top-right",
        autoClose: 2500,
      })
    }
  }

  // ✅ ส่งเรียบร้อย (local only)
  const handleMarkShipped = async (id: number) => {
    try {
      setOrders((prev) =>
        prev.map((o) =>
          o.order.id === id ? { ...o, order: { ...o.order, status: "COMPLETED" } } : o
        )
      )
      toast.success(`✅ ส่งสินค้าเรียบร้อย (Order #${id})`, {
        position: "top-right",
        autoClose: 2500,
      })
    } catch {
      toast.error("ไม่สามารถอัปเดตสถานะได้", {
        position: "top-right",
        autoClose: 2500,
      })
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
                  { key: "prepare", label: "ที่ต้องเตรียมการ" },
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
                    const order = o.order
                    const subtotal = o.order_items.reduce((sum, item) => {
                      const price = item.product?.unit_price ?? 0
                      return sum + price * item.quantity
                    }, 0)
                    const vat = subtotal * 0.07
                    const total = subtotal + vat

                    return (
                      <Card key={order.id} className="bg-white p-6 border shadow-sm">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-semibold">
                                หมายเลขคำสั่งซื้อ
                              </span>{" "}
                              {order.id}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">วันที่สั่งซื้อ</span>{" "}
                              {new Date(order.created_at).toLocaleString("th-TH")}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">สถานะ:</span>{" "}
                              {order.status}
                            </p>
                          </div>

                          {/* Items */}
                          <div className="space-y-2 border-t pt-4">
                            {o.order_items.map((item, idx) => {
                              const p = item.product
                              const subtotalItem =
                                (p?.unit_price ?? 0) * item.quantity
                              return (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    {p
                                      ? `${p.th_name} (${p.en_name})`
                                      : `สินค้า #${item.product_id}`}
                                  </span>
                                  <span>
                                    {item.quantity} ชิ้น{" "}
                                    {p && (
                                      <span className="text-gray-500">
                                        ({p.unit_price} บาท/ชิ้น ={" "}
                                        {subtotalItem.toFixed(2)} บาท)
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
                              <span>{total.toFixed(2)} บาท</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end border-t pt-4 gap-3">
                            {mapStatus(order.status) === "prepare" && (
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleMarkPrepared(order.id, (order as any).delivery_id)}
                              >
                                เตรียมการสำเร็จ
                              </Button>
                            )}
                            {mapStatus(order.status) === "completed" && (
                              <p className="text-sm text-gray-600">
                                ส่งเรียบร้อยแล้ว
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
      </SidebarInset>
    </SidebarProvider>
  )
}
