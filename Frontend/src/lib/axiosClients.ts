import axios from 'axios';

//this is the configuration of the axios api client
//automatically attaches the user's jwt token to the requests
//axios is a javascript library which is used to send http requests from your frontend to your backend
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: { 'Content-Type': 'application/json' },
});


// Once AuthContext exists it writes the token under this same key — every request picks it up automatically.
//this automatically attaches the token to each requests
//this is the "Request Interceptor"- this runs before the configured axios request is sent

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) config.headers.Authorization = `Bearer ${token}`;
  //if token exists the code attaches it to the request
  //The backend's authentication middleware can read this header and validate the JWT.

  return config; //return the modified configuration
  //tells the axios to continue with the request using the modified configuration
});




//Handle successful responses and errors
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) 
        localStorage.removeItem('token');
    return Promise.reject(err);
  }
);


//Bearer - it identifies the authentication scheme used to present the access token,

//?. - this is called optional chaining
//if err.response exists the code checks its status

// The sequence is:
// 1. React calls axiosClient.get('/venues').
// 2. The request interceptor reads localStorage.getItem('token').
// 3. If a token exists, Axios adds Authorization: Bearer ....
// 4. The backend receives the request and checks authentication if required by the route.
// 5. The response interceptor returns successful responses unchanged, or clears the token for a 401 response.
// 6. The calling component receives the response or catches the error.
// The main benefit is that you don't need to manually attach the JWT token in every API function.

