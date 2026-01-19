import type {
  ActiveCustomer,
  LogInResult,
  LogOutResult,
  RegisterResult,
  VerifyResult,
  RequestPasswordResetResult,
  ResetPasswordResult,
} from "~~/types/customer";

export const useCustomerStore = defineStore("customer", () => {
  const api = useApi();
  const authStore = useAuthStore();
  const customer = ref<ActiveCustomer | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCustomer(
    type: "base" | "detail" = "base",
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.getActiveCustomer(type === "detail");
      customer.value = (result.activeCustomer as ActiveCustomer) ?? null;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      }
    } finally {
      loading.value = false;
    }
  }

  async function login(
    email: string,
    password: string,
    rememberMe = true,
  ): Promise<LogInResult | undefined> {
    try {
      const result = await api.login(email, password, rememberMe);

      const loginResult = result.login as Record<string, unknown>;

      if (loginResult && "id" in loginResult) {
        // Save token to auth store
        if (result.token) {
          authStore.setSession(result.token, {
            id: loginResult.id as string,
            email: loginResult.identifier as string,
          });
        }
        await fetchCustomer();
      }

      return loginResult as LogInResult;
    } catch (err) {
      console.error("Login error:", err);
      return undefined;
    }
  }

  async function logout(): Promise<LogOutResult | undefined> {
    try {
      const result = await api.logout();

      if (result.logout.success) {
        customer.value = null;
        authStore.clearSession();
      }

      return result.logout as LogOutResult;
    } catch (err) {
      console.error("Logout error:", err);
      return undefined;
    }
  }

  async function register(input: {
    emailAddress: string;
    firstName: string;
    lastName: string;
    password?: string;
  }): Promise<RegisterResult | undefined> {
    try {
      const result = await api.register(input);
      return result.registerCustomerAccount as RegisterResult;
    } catch (err) {
      console.error("Registration error:", err);
      return undefined;
    }
  }

  async function verify(token: string): Promise<VerifyResult | undefined> {
    try {
      const result = await api.verifyAccount(token);

      const verifyResult = result.verifyCustomerAccount as Record<string, unknown>;
      if (verifyResult && "identifier" in verifyResult) {
        await fetchCustomer();
      }
      return verifyResult as VerifyResult;
    } catch (err) {
      console.error("Unexpected verification error:", err);
      return undefined;
    }
  }

  async function requestPasswordReset(
    emailAddress: string,
  ): Promise<RequestPasswordResetResult | undefined> {
    try {
      const result = await api.requestPasswordReset(emailAddress);
      return result.requestPasswordReset as RequestPasswordResetResult;
    } catch (err) {
      console.error("Password reset request error:", err);
      return undefined;
    }
  }

  async function resetPassword(
    token: string,
    password: string,
  ): Promise<ResetPasswordResult | undefined> {
    try {
      const result = await api.resetPassword(token, password);

      const resetResult = result.resetPassword as Record<string, unknown>;
      if (resetResult && "identifier" in resetResult) {
        await fetchCustomer();
      }

      return resetResult as ResetPasswordResult;
    } catch (err) {
      console.error("Reset password error:", err);
      return undefined;
    }
  }

  return {
    customer,
    loading,
    error,
    fetchCustomer,
    login,
    logout,
    register,
    verify,
    requestPasswordReset,
    resetPassword,
  };
});
