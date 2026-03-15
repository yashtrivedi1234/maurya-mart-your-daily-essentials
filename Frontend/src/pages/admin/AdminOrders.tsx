import React, { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  MoreVertical,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "@/store/api/orderApi";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OrderItem {
  product: {
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  price?: number;
}

interface Order {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  items: OrderItem[];
}

const AdminOrders = () => {
  const { data: orders, isLoading } = useGetAllOrdersQuery({});
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders?.filter((o: Order) => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-700";
      case "Shipped": return "bg-blue-100 text-blue-700";
      case "Processing": return "bg-orange-100 text-orange-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and tracking status.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders (ID or Customer)..." 
              className="pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading orders...</td>
                </tr>
              ) : filteredOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No orders found.</td>
                </tr>
              ) : filteredOrders?.map((order: Order) => (
                <tr key={order._id} className="group hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-semibold text-sm">#{order._id.substring(order._id.length - 8)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                        {order.user?.name?.charAt(0) || "U"}
                      </div>
                      <span className="text-sm font-medium">{order.user?.name || "Deleted User"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{format(new Date(order.createdAt), "dd MMM, yyyy")}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(order.createdAt), "HH:mm")}</p>
                  </td>
                  <td className="p-4 font-bold text-sm">₹{order.totalPrice.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full outline-none border-none cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsOpen(true);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?._id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Customer Information</h4>
                  <p className="font-semibold text-lg">{selectedOrder.user?.name}</p>
                  <p className="text-muted-foreground">{selectedOrder.user?.email}</p>
                  <p className="text-muted-foreground mt-2">{selectedOrder.shippingAddress || "No address provided"}</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Order Information</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-bold uppercase ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-bold text-green-600">{selectedOrder.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-bold">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: OrderItem, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
                      <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center font-bold text-primary">
                        {item.product?.image ? <img src={item.product.image} className="w-full h-full object-cover rounded-lg" /> : "P"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.product?.name || "Product Name"}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">₹{(item.price || item.product?.price || 0) * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{selectedOrder.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminOrders;
