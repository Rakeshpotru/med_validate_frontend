export const login = (email: string, password: string): Promise<boolean> => {
  // Simulate successful login if email is "test@test.com" and password is "123456"
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === "test@test.com" && password === "123456") {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};
