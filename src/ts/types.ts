export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  phone: string
  address: string
  createdAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  totalAmount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
}

export interface ActivityLog {
  id: string
  action: string
  details: string
  timestamp: string
}

export interface Admin {
  username: string
  password: string
}
