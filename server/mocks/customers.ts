// Mock data for customers

export interface Address {
  id: string;
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  postalCode: string;
  country: {
    code: string;
    name: string;
  };
  phoneNumber?: string;
}

export interface Customer {
  id: string;
  title?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string;
  addresses: Address[];
  user?: {
    id: string;
    identifier: string;
  };
}

export interface CurrentUser {
  id: string;
  identifier: string;
}

// Mock customers database
const mockCustomers: Map<string, Customer & { password: string }> = new Map([
  [
    "demo@example.com",
    {
      id: "cust-1",
      title: "Mr",
      firstName: "John",
      lastName: "Doe",
      emailAddress: "demo@example.com",
      phoneNumber: "+1-555-123-4567",
      addresses: [
        {
          id: "addr-1",
          fullName: "John Doe",
          streetLine1: "123 Main Street",
          streetLine2: "Apt 4B",
          city: "New York",
          postalCode: "10001",
          country: { code: "US", name: "United States" },
          phoneNumber: "+1-555-123-4567",
        },
      ],
      user: {
        id: "user-1",
        identifier: "demo@example.com",
      },
      password: "password123",
    },
  ],
  [
    "jane@example.com",
    {
      id: "cust-2",
      title: "Ms",
      firstName: "Jane",
      lastName: "Smith",
      emailAddress: "jane@example.com",
      phoneNumber: "+1-555-987-6543",
      addresses: [
        {
          id: "addr-2",
          fullName: "Jane Smith",
          streetLine1: "456 Oak Avenue",
          city: "Los Angeles",
          postalCode: "90001",
          country: { code: "US", name: "United States" },
        },
      ],
      user: {
        id: "user-2",
        identifier: "jane@example.com",
      },
      password: "password456",
    },
  ],
]);

// Session storage (in-memory)
const sessions: Map<string, string> = new Map(); // token -> email

// Generate a simple token
function generateToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Login user
export function loginUser(
  emailAddress: string,
  password: string,
  _rememberMe: boolean
):
  | { success: true; currentUser: CurrentUser; token: string }
  | { success: false; errorCode: string; message: string } {
  const customer = mockCustomers.get(emailAddress);

  if (!customer) {
    return {
      success: false,
      errorCode: "INVALID_CREDENTIALS_ERROR",
      message: "Invalid email or password",
    };
  }

  if (customer.password !== password) {
    return {
      success: false,
      errorCode: "INVALID_CREDENTIALS_ERROR",
      message: "Invalid email or password",
    };
  }

  const token = generateToken();
  sessions.set(token, emailAddress);

  return {
    success: true,
    currentUser: {
      id: customer.user!.id,
      identifier: customer.user!.identifier,
    },
    token,
  };
}

// Logout user
export function logoutUser(token: string): { success: boolean } {
  sessions.delete(token);
  return { success: true };
}

// Get active customer by token
export function getActiveCustomer(token: string): Customer | null {
  const email = sessions.get(token);
  if (!email) return null;

  const customer = mockCustomers.get(email);
  if (!customer) return null;

  // Return customer without password
  const { password: _, ...customerData } = customer;
  return customerData;
}

// Register new customer
export function registerCustomer(input: {
  emailAddress: string;
  firstName: string;
  lastName: string;
  password?: string;
}):
  | { success: true }
  | { success: false; errorCode: string; message: string } {
  if (mockCustomers.has(input.emailAddress)) {
    return {
      success: false,
      errorCode: "EMAIL_ADDRESS_CONFLICT_ERROR",
      message: "An account with this email already exists",
    };
  }

  const newCustomer: Customer & { password: string } = {
    id: `cust-${Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    emailAddress: input.emailAddress,
    addresses: [],
    user: {
      id: `user-${Date.now()}`,
      identifier: input.emailAddress,
    },
    password: input.password || "defaultPassword123",
  };

  mockCustomers.set(input.emailAddress, newCustomer);

  return { success: true };
}

// Verify customer account (mock - always succeeds)
export function verifyCustomerAccount(
  _token: string,
  _password?: string
):
  | { success: true; currentUser: CurrentUser }
  | { success: false; errorCode: string; message: string } {
  // In real implementation, would verify token
  // For mock, we'll just return success
  return {
    success: true,
    currentUser: {
      id: "user-verified",
      identifier: "verified@example.com",
    },
  };
}

// Request password reset (mock - always succeeds)
export function requestPasswordReset(
  _emailAddress: string
): { success: boolean } {
  return { success: true };
}

// Reset password (mock - always succeeds)
export function resetPassword(
  _token: string,
  _password: string
):
  | { success: true; currentUser: CurrentUser }
  | { success: false; errorCode: string; message: string } {
  return {
    success: true,
    currentUser: {
      id: "user-reset",
      identifier: "reset@example.com",
    },
  };
}

// Get customer addresses
export function getCustomerAddresses(token: string): Address[] {
  const customer = getActiveCustomer(token);
  return customer?.addresses || [];
}
