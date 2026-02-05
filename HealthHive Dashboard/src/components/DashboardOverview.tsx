import { MetricCard } from "./MetricCard";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

const salesData = [
  { month: 'Jan', revenue: 4200, orders: 120 },
  { month: 'Feb', revenue: 5100, orders: 145 },
  { month: 'Mar', revenue: 4800, orders: 132 },
  { month: 'Apr', revenue: 6200, orders: 168 },
  { month: 'May', revenue: 7100, orders: 195 },
  { month: 'Jun', revenue: 6800, orders: 182 },
];

const trafficData = [
  { name: 'Mon', visitors: 2400 },
  { name: 'Tue', visitors: 1398 },
  { name: 'Wed', visitors: 3800 },
  { name: 'Thu', visitors: 3908 },
  { name: 'Fri', visitors: 4800 },
  { name: 'Sat', visitors: 3200 },
  { name: 'Sun', visitors: 2780 },
];

const recentOrders = [
  { id: '#1234', customer: 'Alice Johnson', product: 'Wireless Headphones', amount: '$129.99', status: 'Completed' },
  { id: '#1235', customer: 'Bob Smith', product: 'Smart Watch', amount: '$299.99', status: 'Processing' },
  { id: '#1236', customer: 'Carol White', product: 'Laptop Stand', amount: '$49.99', status: 'Completed' },
  { id: '#1237', customer: 'David Brown', product: 'USB-C Hub', amount: '$79.99', status: 'Pending' },
  { id: '#1238', customer: 'Emma Davis', product: 'Mechanical Keyboard', amount: '$159.99', status: 'Completed' },
];

export function DashboardOverview() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Overview</h2>
        <p className="text-slate-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value="$45,231"
          change="+20.1% from last month"
          isPositive={true}
          icon={DollarSign}
          iconColor="bg-blue-500"
        />
        <MetricCard
          title="Customers"
          value="2,345"
          change="+15.3% from last month"
          isPositive={true}
          icon={Users}
          iconColor="bg-green-500"
        />
        <MetricCard
          title="Orders"
          value="942"
          change="+12.5% from last month"
          isPositive={true}
          icon={ShoppingCart}
          iconColor="bg-purple-500"
        />
        <MetricCard
          title="Growth"
          value="23.5%"
          change="-2.4% from last month"
          isPositive={false}
          icon={TrendingUp}
          iconColor="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="visitors" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        order.status === 'Completed' ? 'default' : 
                        order.status === 'Processing' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
