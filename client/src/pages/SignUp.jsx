import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Container, Typography, Box, CircularProgress, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PersonAdd, Mail, Lock, Cake, Wc } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { setUser, setLoading, setError } from '../redux/slices/userSlice';
import axios from 'axios';
import dayjs from 'dayjs';
import Icon from '../assets/icon.svg'

const SignUp = () => {
  const [username, setUsername] = useState('');
  
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [DOB, setDOB] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username,
        email,
        password,
        gender,
        DOB: DOB ? DOB.toISOString() : null,
      });
      dispatch(setUser(response.data));
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Signed up successfully!');
      navigate('/dashboard');
    } catch (error) {
      dispatch(setError(error.data || 'Failed to sign up. Please try again.'));
      toast.error(error.response?.data?.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src={Icon} alt="weConnect Logo" style={{ width: '100px', height: '100px' }} />
        <Typography component="h1" variant="h4" sx={{ color: '#64B5F6', mb: 3 }}>
          weConnect
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: <PersonAdd sx={{ color: '#64B5F6', mr: 1 }} />,
            }}
          />
         
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <Lock sx={{ color: '#64B5F6', mr: 1 }} />,
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender"
              value={gender}
              label="Gender"
              onChange={(e) => setGender(e.target.value)}
              startAdornment={<Wc sx={{ color: '#64B5F6', mr: 1 }} />}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date of Birth"
              value={DOB}
              onChange={(newValue) => setDOB(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Cake sx={{ color: '#64B5F6', mr: 1 }} />,
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: '#64B5F6', '&:hover': { bgcolor: '#1E88E5' } }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#64B5F6' }}>
              Log in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;