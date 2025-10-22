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
import { Deliveries } from "@/lib/api/deliveries"
import { Inventory, ProductEntity } from "@/lib/api/inventory"
import { toast } from "react-toastify"

type OrderStatus = "prepare" | "completed"

interface DetailedOrderItem {
  product_id: number
  quantity: number
  product?: ProductEntity
}

interface DeliveryEntity {
  id: string
  order_id: number
  status: string
  created_at: string
}

interface DetailedOrder {
  delivery: DeliveryEntity
  order_items: DetailedOrderItem[]
}

export default function DoctorOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("prepare")
  const [orders, setOrders] = useState<DetailedOrder[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Fetch deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        console.log("🚚 [DoctorOrdersPage] Fetching deliveries...")
        const res = await Deliveries.getAllDeliveries()
        console.log("✅ Deliveries response:", res)

        const data = res?.data || []
        console.log("📦 Deliveries count:", data.length)

        const enriched: DetailedOrder[] = await Promise.all(
          data.map(async (delivery: any) => {
            console.log("🔹 Processing delivery:", delivery.id, delivery.status)

            let orderItems: DetailedOrderItem[] = []
            try {
              if (delivery.order?.order_items?.length) {
                orderItems = delivery.order.order_items
              }
            } catch (err) {
              console.warn("⚠️ Missing order_items for delivery:", delivery.id)
            }

            // enrich product info
            const ids = orderItems.map((i) => i.product_id).join(",")
            if (ids) {
              try {
                const inv = await Inventory.getProducts(ids)
                const map: Record<number, ProductEntity> = {}
                inv.data.forEach((p) => (map[p.id] = p))
                orderItems = orderItems.map((item) => ({
                  ...item,
                  product: map[item.product_id],
                }))
              } catch (err) {
                console.error("❌ Enrich product failed:", err)
              }
            }

            return { delivery, order_items: orderItems }
          })
        )

        setOrders(enriched)
      } catch (err) {
        console.error("❌ Fetch deliveries error:", err)
        toast.error("โหลดข้อมูลการจัดส่งไม่สำเร็จ", { position: "top-right" })
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [])

  // ✅ Map backend -> UI tab
  const mapStatus = (status: string): OrderStatus => {
    switch (status.toUpperCase()) {
      case "DELIVERY_PENDING":
        return "prepare"
      case "DELIVERED":
      case "COMPLETED":
        return "completed"
      default:
        return "prepare"
    }
  }

  const filteredOrders = orders.filter(
    (o) => mapStatus(o.delivery.status) === activeTab
  )

  // ✅ Doctor confirms delivery
  const handleConfirmDelivery = async (id: string) => {
    try {
      console.log("📦 Confirming delivery:", id)
      await Deliveries.updateStatus(id, "DELIVERED")

      setOrders((prev) =>
        prev.map((o) =>
          o.delivery.id === id
            ? { ...o, delivery: { ...o.delivery, status: "DELIVERED" } }
            : o
        )
      )

      toast.success(`✅ ยืนยันการจัดส่งสำเร็จ (Delivery #${id})`, {
        position: "top-right",
        autoClose: 2500,
      })
    } catch (err) {
      console.error("❌ Failed to update delivery:", err)
      toast.error("ไม่สามารถอัปเดตสถานะได้", { position: "top-right" })
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
                รายการจัดส่งยา
              </h1>

              {/* Tabs */}
              <div className="mb-6 flex gap-2">
                {[
                  { key: "prepare", label: "รอการจัดส่ง" },
                  { key: "completed", label: "จัดส่งสำเร็จ" },
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

              {/* Deliveries List */}
              {loading ? (
                <p className="text-center text-gray-500">กำลังโหลด...</p>
              ) : filteredOrders.length === 0 ? (
                <p className="text-center text-gray-500">
                  ไม่มีรายการจัดส่งในหมวดนี้
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((o) => {
                    const d = o.delivery
                    const subtotal = o.order_items.reduce((sum, item) => {
                      const price = item.product?.unit_price ?? 0
                      return sum + price * item.quantity
                    }, 0)
                    const vat = subtotal * 0.07
                    const total = subtotal + vat

                    return (
                      <Card key={d.id} className="bg-white p-6 border shadow-sm">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-semibold">
                                หมายเลขการจัดส่ง
                              </span>{" "}
                              {d.id}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">วันที่สร้าง:</span>{" "}
                              {new Date(d.created_at).toLocaleString("th-TH")}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">สถานะ:</span>{" "}
                              {d.status === "DELIVERED"
                                ? "จัดส่งสำเร็จ"
                                : d.status}
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
                            {mapStatus(d.status) === "prepare" ? (
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleConfirmDelivery(d.id)}
                              >
                                ยืนยันการจัดส่ง
                              </Button>
                            ) : (
                              <p className="text-sm text-gray-600">
                                จัดส่งสำเร็จแล้ว
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
