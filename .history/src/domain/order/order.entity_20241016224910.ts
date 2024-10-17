export class Order {
    id: number;
    userId: number;
    orderDate: Date;
    status: string;
    totalAmount: number;
    items: OrderItem[];
  }

  export class OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
  }
  