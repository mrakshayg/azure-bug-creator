export const MOCK_BUGS = [
  { id: 'BUG-0891', title: 'Login page crashes on incorrect password', status: 'Active', module: 'Login', environment: 'QA', date: 'Mar 28, 2026' },
  { id: 'BUG-0876', title: 'Dashboard charts not loading on Safari', status: 'In Progress', module: 'Dashboard', environment: 'Staging', date: 'Mar 26, 2026' },
  { id: 'BUG-0854', title: 'Export to CSV missing last column', status: 'Resolved', module: 'Reports', environment: 'Production', date: 'Mar 22, 2026' },
  { id: 'BUG-0841', title: 'User avatar not updating after profile save', status: 'Active', module: 'Settings', environment: 'QA', date: 'Mar 20, 2026' },
]

export const MODULES = ['Login', 'Dashboard', 'Reports', 'Settings', 'Other']
export const ENVIRONMENTS = ['QA', 'Staging', 'Production']
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
export const SEVERITIES = ['1 - Critical', '2 - Major', '3 - Minor', '4 - Trivial']

export const STATUS_COLORS = {
  'Active': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Resolved': 'bg-green-100 text-green-700',
}

export const MOCK_PARSED_OUTPUT = {
  title: 'Login page crashes on submitting empty password field',
  steps: '1. Navigate to the login page\n2. Enter a valid username\n3. Leave the password field empty\n4. Click the "Login" button',
  expectedResult: 'An inline validation message should appear: "Password is required"',
  actualResult: 'The page crashes with a white screen and console error: TypeError: Cannot read property of undefined',
  priority: 'High',
  severity: '2 - Major',
}
