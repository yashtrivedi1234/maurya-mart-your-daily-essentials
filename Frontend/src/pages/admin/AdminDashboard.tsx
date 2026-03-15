import React from "react";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetCartQuery } from "@/store/api/cartApi";

const AdminDashboard = () => {
  // In a real app, we would have an adminStats hook
  const { data: products } = useGetProductsQuery({});
  
  const stats = [
    { 
      name: "Total Products", 
      value: products?.length || 0, 
      icon: Package, 
      change: "+4.5%", 
      trend: "up",
      color: "bg-blue-500"
    },
    { 
      name: "Total Orders", 
      value: "128", 
      icon: ShoppingBag, 
      change: "+12.2%", 
      trend: "up",
      color: "bg-primary"
    },
    { 
      name: "Total Users", 
      value: "1,204", 
      icon: Users, 
      change: "+8.1%", 
      trend: "up",
      color: "bg-purple-500"
    },
    { 
      name: "Revenue", 
      value: "₹45,230", 
      icon: TrendingUp, 
      change: "-2.4%", 
      trend: "down",
      color: "bg-orange-500"
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Super Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}/20`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Recent Orders</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left bg-muted/50 rounded-lg">
                <tr>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="group hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-sm">#ORD-{1000 + i}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                          C
                        </div>
                        <span className="text-sm font-medium">Customer {i}</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-sm">₹{1200 + i * 100}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        i % 2 === 0 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {i % 2 === 0 ? "Delivered" : "Processing"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <h3 className="font-display font-bold text-lg mb-6">Recent Activities</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  i === 1 ? "bg-blue-100 text-blue-600" : 
                  i === 2 ? "bg-green-100 text-green-600" : 
                  "bg-orange-100 text-orange-600"
                }`}>
                  {i === 1 ? <Package className="h-4 w-4" /> : 
                   i === 2 ? <CheckCircle2 className="h-4 w-4" /> : 
                   <Clock className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {i === 1 ? "New product added: Organic Rice" : 
                     i === 2 ? "Order #1204 marked as delivered" : 
                     "Customer update on Order #1200"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{i * 10} minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border-2 border-dashed border-muted text-muted-foreground font-bold hover:bg-muted/30 transition-all text-sm">
            View Activity Log
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
