export const ToasterMessages = {
  loginSuccess: 'Login successfull',
  captchaInvalid: 'Please complete the captcha correctly.',
  accountLocked: 'Your account is locked. Please try again later.',
  tempPassword: 'Temporary password detected. Please reset your password.',
  passwordExpired: 'Your password has expired. Please update it.',
  registrationSuccess: "User created successfully",
  userexist: "User already registered",
  registrationFailure: "Failed to create user",
  bulkRegistrationSuccess: "Bulk import successful",
  bulkRegistrationFailure: "Bulk import failed",
  userDeleteSuccess: "User deleted successfully",
  userDeleteFailed: "User delete failed",
  connection_error: "Unable to connect. Please check your internet or try again later.",
  validationError: "Invalid input. Please check the form and try again." // 🔥 New message for 422
};
export const FieldErrors = {
  email: 'Please enter a valid email address.',
  password: 'Please enter a valid password.',
};

// Labels (optional - can be reused in multiple places)
export const FormLabels = {
  login: 'Login',
  loggingIn: 'Logging in...',
  emptyEmail: 'Please Enter Email.',
  emailwarn: 'Please Enter a Valid Email.',
  emptyPassword: 'Please Enter Password.',
  passwordWarn: 'Please Enter The correct Password.',
  passwordexpression: 'Password Must contain 12 characters.',
  loginSuccess: 'Login successful...',
  error: 'Something went wrong',
  registrationsuccess: 'User registration Success...',
  registrationerror: 'User registration Failed',
  userListUpdated: 'User list updated successfully',
  userListFailed: 'Failed to update user list',
  bulkUploadSuccess: 'Bulk data uploaded successfully',
  bulkUploadFailed: 'Bulk upload failed',
  readingFile: 'Reading file...',
  fileLoadedSuccess: 'File loaded successfully',
  passwordMismatch: 'Passwords do not match.',
};

export const RegexPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^.{6,}$/ // At least 6 characters
};

export const validateEmail = (email: string) => RegexPatterns.email.test(email);
export const validatePassword = (password: string) => RegexPatterns.password.test(password);

export const isNewMekEmail = (email: string): boolean =>
  email?.toLowerCase().endsWith('@newmeksolutions.com');
