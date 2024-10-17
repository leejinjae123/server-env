export class MockPrismaService {
    private users = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        balance: 100.0,
        orders: [],
        createdAt: new Date(),
      },
    ];
  
    private products = [
      {
        id: 1,
        name: 'Product 1',
        price: 20.0,
        stock: 100,
        orderItems: [],
      },
      {
        id: 2,
        name: 'Product 2',
        price: 50.0,
        stock: 200,
        orderItems: [],
      },
    ];
  
    private orders = [
      {
        id: 1,
        userId: 1,
        orderDate: new Date(),
        status: 'completed',
        totalAmount: 70.0,
        items: [],
      },
    ];
  
    private orderItems = [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: 20.0,
      },
      {
        id: 2,
        orderId: 1,
        productId: 2,
        quantity: 1,
        price: 50.0,
      },
    ];
  
    // User 모델에 대한 CRUD 예시
    async user() {
      return this.users;
    }
  
    async createUser(data: { name: string; email: string; balance?: number }) {
      const newUser = {
        id: this.users.length + 1,
        name: data.name,
        email: data.email,
        balance: data.balance || 0,
        orders: [],
        createdAt: new Date(),
      };
      this.users.push(newUser);
      return newUser;
    }
  
    async updateUser(id: number, data: Partial<{ name: string; email: string; balance: number }>) {
      const user = this.users.find((u) => u.id === id);
      if (!user) throw new Error('User not found');
      Object.assign(user, data);
      return user;
    }
  
    // Product 모델에 대한 CRUD 예시
    async product() {
      return this.products;
    }
  
    async createProduct(data: { name: string; price: number; stock: number }) {
      const newProduct = {
        id: this.products.length + 1,
        name: data.name,
        price: data.price,
        stock: data.stock,
        orderItems: [],
      };
      this.products.push(newProduct);
      return newProduct;
    }
  
    async updateProduct(id: number, data: Partial<{ name: string; price: number; stock: number }>) {
      const product = this.products.find((p) => p.id === id);
      if (!product) throw new Error('Product not found');
      Object.assign(product, data);
      return product;
    }
  
    // Order 모델에 대한 CRUD 예시
    async order() {
      return this.orders;
    }
  
    async createOrder(data: { userId: number; status: string; totalAmount: number }) {
      const newOrder = {
        id: this.orders.length + 1,
        userId: data.userId,
        orderDate: new Date(),
        status: data.status,
        totalAmount: data.totalAmount,
        items: [],
      };
      this.orders.push(newOrder);
      return newOrder;
    }
  
    async updateOrder(id: number, data: Partial<{ status: string; totalAmount: number }>) {
      const order = this.orders.find((o) => o.id === id);
      if (!order) throw new Error('Order not found');
      Object.assign(order, data);
      return order;
    }
  
    // OrderItem 모델에 대한 CRUD 예시
    async orderItem() {
      return this.orderItems;
    }
  
    async createOrderItem(data: { orderId: number; productId: number; quantity: number; price: number }) {
      const newOrderItem = {
        id: this.orderItems.length + 1,
        orderId: data.orderId,
        productId: data.productId,
        quantity: data.quantity,
        price: data.price,
      };
      this.orderItems.push(newOrderItem);
      return newOrderItem;
    }
  
    async updateOrderItem(id: number, data: Partial<{ quantity: number; price: number }>) {
      const orderItem = this.orderItems.find((oi) => oi.id === id);
      if (!orderItem) throw new Error('OrderItem not found');
      Object.assign(orderItem, data);
      return orderItem;
    }
  }
  