import { createSlice } from '@reduxjs/toolkit';

const initialUsers = [
  { id: '1', name: 'Ali', email: 'student@uog.edu.pk', password: '12345' },
  { id: '2', name: 'Kamran', email: 'admin@uog.edu.pk', password: '12345' },
];

const savedUser = JSON.parse(localStorage.getItem('user'));

const initialState = {
  users: initialUsers,
  user: savedUser || null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;
      const foundUser = state.users.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Exclude password from stored user state
        const { password, ...userWithoutPassword } = foundUser;
        state.user = userWithoutPassword;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      } else {
        state.error = 'Invalid email or password';
      }
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('user');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
