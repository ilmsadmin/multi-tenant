import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CheckCircle, Business, Security, Speed, Cloud } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

// Services
import { tenantService } from '../services';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    // State cho modal đăng nhập
  const [loginOpen, setLoginOpen] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // State cho modal đăng ký
  const [registerOpen, setRegisterOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);  
  // Xử lý đăng nhập
  const handleLogin = async () => {
    // Kiểm tra trường trống
    if (!schemaName.trim()) {
      setLoginError('Vui lòng nhập tên tenant');
      return;
    }
    
    // Kiểm tra định dạng schema name - chỉ cho phép chữ, số và gạch dưới
    const schemaPattern = /^[a-zA-Z0-9_]+$/;
    if (!schemaPattern.test(schemaName)) {
      setLoginError('Tên tenant chỉ được chứa chữ cái, số và dấu gạch dưới');
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      // Gọi API kiểm tra tenant schema name
      const response = await tenantService.checkTenantExists(schemaName);
        
      // In thông tin response để kiểm tra
      console.log("Tenant check response:", response);
      
      // Kiểm tra chặt chẽ từng điều kiện
      if (!response) {
        setLoginError('Không nhận được phản hồi từ máy chủ');
        return;
      }
      
      // Kiểm tra chi tiết từng điều kiện để đảm bảo tính an toàn
      const tenantExists = response.exists === true;
      const tenantData = response.tenant;
      const hasValidSchema = tenantData && typeof tenantData.schema_name === 'string' && tenantData.schema_name.trim() !== '';
      
      // Chỉ điều hướng khi đảm bảo tất cả điều kiện
      if (tenantExists && hasValidSchema && tenantData) {
        // TypeScript sẽ hiểu rằng tenantData đã được kiểm tra và không thể là null/undefined ở đây
        navigate(`/tenant/login?schema=${tenantData.schema_name}`);
      } else {
        // Hiển thị thông báo lỗi từ API nếu có
        setLoginError(response.message || 'Tenant không tồn tại hoặc không hợp lệ');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Xử lý lỗi chi tiết hơn
      if (error.response) {
        // Lỗi từ API response
        if (error.response.status === 404) {
          setLoginError('Tên tenant không tồn tại trong hệ thống');
        } else if (error.response.status === 403) {
          setLoginError('Tenant hiện đang bị khóa hoặc tạm ngưng');
        } else {
          setLoginError(`Lỗi xác thực: ${error.response.data?.message || 'Không thể kết nối đến máy chủ'}`);
        }
      } else if (error.request) {
        // Lỗi không nhận được response
        setLoginError('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng');
      } else {
        // Lỗi khác
        setLoginError('Có lỗi xảy ra khi kiểm tra tên tenant');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Xử lý đăng ký
  const handleRegister = async () => {
    // Validate form
    if (!fullName.trim()) {
      setRegisterError('Vui lòng nhập họ tên');
      return;
    }
    
    if (!phoneNumber.trim()) {
      setRegisterError('Vui lòng nhập số điện thoại');
      return;
    }
    
    if (!captchaValue) {
      setRegisterError('Vui lòng xác nhận captcha');
      return;
    }
    
    setIsRegistering(true);
    setRegisterError('');
    
    try {
      // Gọi API đăng ký tài khoản dùng thử
      const response = await tenantService.registerFreeTrial({
        fullName,
        phoneNumber,
        captchaToken: captchaValue
      });
      
      setRegistrationSuccess(true);
      
      // Reset form
      setFullName('');
      setPhoneNumber('');
      setCaptchaValue(null);
    } catch (error) {
      setRegisterError('Có lỗi xảy ra khi đăng ký tài khoản');
      console.error('Registration error:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
  };

  // Components for feature sections
  const Feature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: 2,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}>{icon}</Box>
      <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          pt: { xs: 10, md: 16 },
          pb: { xs: 12, md: 20 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%)',
          }
        }}
      >        <Container maxWidth="lg">          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  mb: 2
                }}
              >
                Giải pháp Đa Tenant Toàn Diện
              </Typography>
              <Typography 
                variant="h5"
                component="p"
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  maxWidth: '600px'
                }}
              >
                Nền tảng quản lý doanh nghiệp mạnh mẽ với khả năng tùy chỉnh cho từng khách hàng riêng biệt
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => setRegisterOpen(true)}
                  sx={{ 
                    minWidth: '180px', 
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  Dùng thử miễn phí
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setLoginOpen(true)}
                  sx={{ 
                    minWidth: '120px', 
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Đăng nhập
                </Button>
              </Box>
            </Grid>            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img"
                src="/images/hero-image.svg"
                alt="Dashboard Preview"
                sx={{
                  width: '100%',
                  maxWidth: '500px',
                  borderRadius: 2,
                  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
                  transform: 'perspective(1000px) rotateY(-10deg)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feature Section */}
      <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 2 }}>        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={<Business />}
              title="Quản lý đa doanh nghiệp"
              description="Quản lý nhiều doanh nghiệp trên cùng một nền tảng với dữ liệu hoàn toàn tách biệt"
            />          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={<Security />}
              title="Bảo mật cao"
              description="Mỗi tenant đều có phạm vi dữ liệu riêng biệt, đảm bảo an toàn thông tin tuyệt đối"
            />          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={<Speed />}
              title="Hiệu suất tối ưu"
              description="Hệ thống được tối ưu hóa để đảm bảo tốc độ và hiệu suất cao cho mọi tenant"
            />          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={<Cloud />}
              title="Linh hoạt mở rộng"
              description="Dễ dàng mở rộng quy mô và thêm các tính năng mới khi doanh nghiệp phát triển"
            />
          </Grid>
        </Grid>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 10 }}>
        {/* Giới thiệu */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Giải pháp quản lý doanh nghiệp đa tenant
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
          >
            Nền tảng của chúng tôi cho phép quản lý nhiều doanh nghiệp trên cùng một hệ thống,
            với dữ liệu và cấu hình riêng biệt cho mỗi đơn vị.
          </Typography>
            <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/feature-image-1.svg"
                alt="Dashboard Features"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                }}
              />            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom fontWeight="bold">
                Tùy chỉnh cho từng đơn vị
              </Typography>
              <Typography variant="body1" paragraph>
                Mỗi tenant sẽ có môi trường quản trị riêng biệt, với khả năng tùy chỉnh giao diện, 
                chức năng và quy trình làm việc phù hợp với nhu cầu cụ thể.
              </Typography>
              <Box sx={{ mt: 2 }}>
                {['Giao diện tùy chỉnh', 'Phân quyền chi tiết', 'Báo cáo riêng biệt', 'Tích hợp API'].map((item) => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Lợi ích */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Lợi ích khi sử dụng nền tảng
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
          >
            Giải pháp của chúng tôi mang lại nhiều lợi ích cho cả nhà cung cấp dịch vụ và khách hàng sử dụng
          </Typography>
            <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{
                  p: 4, 
                  height: '100%', 
                  borderRadius: 2,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  Cho nhà cung cấp dịch vụ
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {[
                    'Quản lý tập trung, dễ dàng triển khai',
                    'Tiết kiệm chi phí vận hành và bảo trì',
                    'Dễ dàng mở rộng quy mô khi cần thiết',
                    'Nâng cấp hệ thống đồng bộ cho tất cả tenant'
                  ].map((item) => (
                    <Box key={item} sx={{ display: 'flex', mb: 2 }}>
                      <CheckCircle color="primary" sx={{ mr: 1, flexShrink: 0, mt: 0.3 }} />
                      <Typography variant="body1">{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{
                  p: 4, 
                  height: '100%', 
                  borderRadius: 2,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  Cho khách hàng
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {[
                    'Môi trường làm việc riêng biệt và an toàn',
                    'Khả năng tùy chỉnh theo nhu cầu cụ thể',
                    'Trải nghiệm người dùng nhất quán',
                    'Tiết kiệm chi phí đầu tư cơ sở hạ tầng'
                  ].map((item) => (
                    <Box key={item} sx={{ display: 'flex', mb: 2 }}>
                      <CheckCircle color="primary" sx={{ mr: 1, flexShrink: 0, mt: 0.3 }} />
                      <Typography variant="body1">{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* CTA */}
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 6, 
            borderRadius: 4, 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            }
          }}
        >
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
            Bắt đầu sử dụng ngay hôm nay
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            Đăng ký dùng thử miễn phí trong 14 ngày để trải nghiệm đầy đủ tính năng của nền tảng
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => setRegisterOpen(true)}
            sx={{ 
              minWidth: '200px', 
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Dùng thử miễn phí
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Về chúng tôi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chúng tôi cung cấp nền tảng quản lý doanh nghiệp đa tenant hiện đại, 
                giúp các doanh nghiệp vận hành hiệu quả và mở rộng nhanh chóng.
              </Typography>            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Liên hệ
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Email: contact@example.com
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Điện thoại: +84 123 456 789
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Chính sách
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <Box component="ul" sx={{ pl: 2 }}>
                  <Box component="li" sx={{ mb: 1 }}>Điều khoản sử dụng</Box>
                  <Box component="li" sx={{ mb: 1 }}>Chính sách bảo mật</Box>
                  <Box component="li" sx={{ mb: 1 }}>Chính sách hoàn tiền</Box>
                  <Box component="li">Câu hỏi thường gặp</Box>
                </Box>
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Multi-Tenant Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>      {/* Login Dialog */}      <Dialog 
        open={loginOpen}
        onClose={() => {
          // Reset tất cả các trạng thái khi đóng dialog
          setLoginOpen(false);
          setSchemaName('');
          setLoginError('');
          setIsLoggingIn(false);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Đăng nhập          <IconButton
            aria-label="close"
            onClick={() => {
              // Reset tất cả các trạng thái khi đóng dialog
              setLoginOpen(false);
              setSchemaName('');
              setLoginError('');
              setIsLoggingIn(false);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Vui lòng nhập tên tenant của bạn để đăng nhập vào hệ thống
          </Typography>
          <Box sx={{ bgcolor: 'info.lighter', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" color="info.main">
              <strong>Lưu ý:</strong> Tên tenant là tên schema trong cơ sở dữ liệu. 
              Chỉ chấp nhận chữ cái, số và dấu gạch dưới (a-z, A-Z, 0-9, _).
            </Typography>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            id="schemaName"
            label="Tên Tenant"
            type="text"            fullWidth
            variant="outlined"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            error={!!loginError}
            helperText={loginError}
            sx={{ mt: 1 }}
            placeholder="company_name"
          />
        </DialogContent>        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => {
            setLoginOpen(false);
            setSchemaName('');
            setLoginError('');
            setIsLoggingIn(false);
          }}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog 
        open={registerOpen}
        onClose={() => {
          if (!isRegistering) {
            setRegisterOpen(false);
            setRegistrationSuccess(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {registrationSuccess ? 'Đăng ký thành công' : 'Đăng ký dùng thử miễn phí'}
          <IconButton
            aria-label="close"
            onClick={() => {
              if (!isRegistering) {
                setRegisterOpen(false);
                setRegistrationSuccess(false);
              }
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {registrationSuccess ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Đăng ký dùng thử thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Chúng tôi đã gửi thông tin đăng nhập đến số điện thoại của bạn.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Vui lòng kiểm tra tin nhắn để tiếp tục.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                Đăng ký tài khoản để trải nghiệm đầy đủ tính năng miễn phí trong 14 ngày
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="fullName"
                label="Họ và tên"
                type="text"
                fullWidth
                variant="outlined"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                id="phoneNumber"
                label="Số điện thoại"
                type="tel"
                fullWidth
                variant="outlined"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Đây là sitekey test của Google
                  onChange={handleCaptchaChange}
                />
              </Box>
              {registerError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {registerError}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {registrationSuccess ? (
            <Button 
              variant="contained" 
              onClick={() => {
                setRegisterOpen(false);
                setRegistrationSuccess(false);
              }}
              fullWidth
            >
              Đóng
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => setRegisterOpen(false)}
                disabled={isRegistering}
              >
                Hủy
              </Button>
              <Button 
                variant="contained" 
                onClick={handleRegister}
                disabled={isRegistering || !captchaValue}
              >
                {isRegistering ? <CircularProgress size={24} /> : 'Đăng ký'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
