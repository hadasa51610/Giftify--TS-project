declare global {
  interface Window {
    addToCartGlobal: (productId: string) => void
    updateQuantityGlobal: (productId: string, change: number) => void
    removeItemGlobal: (productId: string) => void
    showCheckoutForm: () => void
    editProductGlobal: (productId: string) => void
    deleteProductGlobal: (productId: string) => void
    cancelFormGlobal: () => void
    updateOrderStatusGlobal: (orderId: string, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") => void
    viewOrderDetailsGlobal: (orderId: string) => void
    closeModalGlobal: () => void
  }
}

export {}
