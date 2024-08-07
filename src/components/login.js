import React, { useState, useEffect } from "react";
import './login.css';
import { fetchBatchData,fetchLoginData,fetchStudentsData } from "./data";
import { isStudentAuth, isAdminAuth,isUserFound } from "./dashboard.js";
import { useNavigate } from "react-router-dom";
import { Alert, closeAlert } from "./dashboard.js";
import axios from "axios";
import { date_time } from "./dashboard-header.js";
import { sendStdAlert } from "./student-info.js";

const Login = () => {
    const history = useNavigate();
    const [studentsData, setStudentsData] = useState([]);
    const [batchesData, setbatchesData] = useState([]);
    const [loginData, setLoginData] = useState([]);
    const [userOTP,setOTP] = useState([]);
    const [userLO, setUserLO] = useState(false);
    const [userForgotDetail,setUserForgotDetail] = useState([]);
    const [review,setReview] = useState(false);
    const [clicked,setClicked] = useState(false);
    const [clickedNo,setClickedNo] = useState([]);
    const [cls, setCls] = useState("");
    const lg_User = sessionStorage.getItem('UserLogout') || 'False';
    const action = sessionStorage.getItem('Tried');

    const date = date_time().split(' ');

    const getBatches = async () => {
        const batches_Data = await fetchBatchData();
        setbatchesData(batches_Data);
    };
    const getLoginData = async () => {
        const login_Data = await fetchLoginData();
        setLoginData(login_Data);
    };
    const getStudents = async () => {
        const student_Data = await fetchStudentsData();
        setStudentsData(student_Data);
    };

    useEffect(() => {
        getStudents();
        getLoginData();
        getBatches();
        isUserFound();
    }, []);

    useEffect(()=>{
        isUserFound();
    },[loginData])

    if (action === 'True'){
        setTimeout(()=>{
            Alert('error','Login required !');
            sessionStorage.setItem('Tried','False');
        },50);
    };

    if (isAdminAuth() && !isStudentAuth()){
        history('/dashboard');
    }else if(!isAdminAuth() && isStudentAuth()){
        localStorage.setItem('Login','False');
        localStorage.setItem('isAuthenticated','False');
        sessionStorage.setItem('SelectedStudent',JSON.stringify([]));
        sessionStorage.setItem('StdID',JSON.stringify([]));
        sessionStorage.setItem('SelectedBatchData',JSON.stringify([]));
        sessionStorage.setItem('StdLogin','False');
        sessionStorage.setItem('Std_Authenticated','False');
        sessionStorage.setItem('isStdAuthenticated','False');
    }else if(!isAdminAuth() && !isStudentAuth()){

        if (lg_User.split('&')[0] === 'True'){
            setTimeout(()=>{
                if (!lg_User.split('').some(char=>char === '~')){
                    setReview(true);
                    document.querySelector('.blurdiv').style.visibility = 'visible';
                }else{
                    sessionStorage.setItem('UserLogout','False');
                };
            },1000);
        };

        const btnRotate = (ele) => {
            if (!batchesData){
                Alert('error','Something went wrong. Please try again later !')
            }else{
                let btnElement = ""
                if (ele === 'Admin'){
                    btnElement = document.querySelector('.admin-login-btn');
                }else if (ele === 'Student'){
                    btnElement = document.querySelector('.std-login-btn');
                };
                btnElement.style.width = '40px';
                btnElement.textContent = "";
                setTimeout(()=>{
                    btnElement.classList.add('login-btn-rotate');
                    setTimeout(()=>{
                        btnElement.classList.remove('login-btn-rotate');
                        btnElement.style.width = '50%';
                        btnElement.textContent = "Login";
                        if (ele === 'Student'){
                            isUserStudent();
                        }else if (ele === 'Admin'){
                            isUserAdmin();
                        }
                    }, 3000);
                }, 300);
            }
        };

        const isUserAdmin = () => {
            const email = document.querySelector('.email-input');
            const blurDiv = document.querySelector('.blurdiv');
            if ((checkAdmin() !== true || checkAdmin() !== false) && checkAdmin() === email.value){
                const otp = Math.floor(100000 + Math.random() * 900000);
                setOTP(otp);
                blurDiv.style.visibility = 'visible';
                sendMail(null,'amarapudinesh1234@gmail.com',otp,'User_OTP');
            }else{
                if (checkAdmin() === true) {
                    const loginUserId = JSON.parse(localStorage.getItem('LoginUserId')) || "";
                    const activeUser = loginData && loginData.find(data => data.id === loginUserId);
                    if (activeUser){
                        if (activeUser.Permission.includes('Granted') || activeUser.Permission.includes('Access')){
                            blurDiv.style.visibility = 'visible';
                            sessionStorage.setItem('LogginedUser',JSON.stringify(activeUser.Username));
                            blurDiv.style.visibility = 'hidden';
                            localStorage.setItem('Login',`True ${date[0]} ${date[1]} ${date[2]}`);
                            localStorage.setItem('isAuthenticated','True');
                            localStorage.setItem('IsUser',JSON.stringify(activeUser.User));
                            localStorage.setItem('UserClass',JSON.stringify(activeUser.Class));
                            sessionStorage.setItem('SelectedStudent',JSON.stringify([]));
                            sessionStorage.setItem('StdID',JSON.stringify([]));
                            sessionStorage.setItem('SelectedBatchData',JSON.stringify([]));
                            sessionStorage.setItem('StdLogin','False');
                            sessionStorage.setItem('isStdAuthenticated','False');
                            sessionStorage.setItem('isAdminLoggined','True');
                            sessionStorage.setItem('isStudentdLoggined','False');
                            history('/dashboard');
                        }else{
                            Alert('error',`Dear ${activeUser.Username}, Your login access has been denied.<br/>Please contact Admin and try again !`)
                        };
                    };
                } else{
                    Alert('error','Invalid username or password !');
                    const isUserCrt = loginData && loginData.find(data=>data.Username === email.value || data.Email === email.value);
                    if(isUserCrt){
                        sendStdAlert(isUserCrt.Email,'Wrong_User');
                    };
                };
            };
        };
        const isUserStudent = () => {
            const stdSelectOpt = document.querySelector('.std-batch-selection');
            const stdUserInput = document.querySelector('.std-email-input');
            const stdErrorMsg = document.querySelector('.std-login-error-msg');
            if (userLO){
                const user_Otp = document.querySelector('.std-login-input');
                if (userOTP === parseInt(user_Otp.value)){
                    sessionStorage.setItem('StdLogin','True');
                    sessionStorage.setItem('isStdAuthenticated','True');
                    localStorage.setItem('Login','False');
                    localStorage.setItem('isAuthenticated','False');
                    sessionStorage.setItem('std_login-OTP','False');
                    sessionStorage.setItem('isStudentdLoggined','True');
                    sessionStorage.setItem('Std_Authenticated','True');
                    localStorage.setItem('IsUser',JSON.stringify([]));
                    localStorage.setItem('UserClass',JSON.stringify([]));
                    history('/studentinfo');
                }else{
                    Alert('error','OTP mismatch. Check and try again !');
                };
            }else{
                if (stdSelectOpt.value !== 'select' && stdUserInput.value.length > 0){
                    const stdData = studentsData && studentsData.find(data=>data.BatchName === stdSelectOpt.value && (data.Email === stdUserInput.value || data.Phone === stdUserInput.value));
                    if (stdData){
                        sessionStorage.setItem('Selected_Student',JSON.stringify(stdData));
                        sessionStorage.setItem('StdID',JSON.stringify(stdData.id));
                        const selectedBatch = batchesData.find(data=>data.BatchName === stdData.BatchName);
                        sessionStorage.setItem('SelectedBatchData',JSON.stringify(selectedBatch));
                        if (stdData.Authentication === 'Active'){
                            const otp = Math.floor(100000 + Math.random() * 900000);
                            setOTP(otp);
                            sendMail(null,stdData.Email,otp,'Std_Login_OTP');
                        }else if(stdData.Access === 'Denied'){
                            Alert('error','Your login access denied. Contact Administration !');
                        }else if(stdData.Access === 'Granted'){
                            sessionStorage.setItem('StdLogin','True');
                            sessionStorage.setItem('isStdAuthenticated','True');
                            localStorage.setItem('Login','False');
                            localStorage.setItem('isAuthenticated','False');
                            sessionStorage.setItem('isStudentdLoggined','True');
                            history('/studentinfo');
                        };
                    }else{
                        Alert('error',"Sorry, we couldn't find the student.<br/>Check the information you entered and try again !")
                        stdErrorMsg.style.visibility = 'visible';
                    }
                }else{
                    Alert('error', 'Error finding student. Please check your input and try again.');
                    stdErrorMsg.style.visibility = 'visible';
                }
            };
        };

        const showPassword = () => {
            const passEle = document.querySelector('.pass-show');
            const passInput = document.querySelector('.password-input');
            if (passEle.getAttribute('src') === 'images/show-pass-icon.png') {
                passEle.style.height = '0';
                setTimeout(function () {
                    passEle.style.width = '30px';
                    passEle.style.height = '15px';
                    passEle.setAttribute('src', 'images/hide-pass-icon.png');
                    passInput.type = 'password';
                }, 500);
            } else {
                passEle.style.height = '0';
                setTimeout(function () {
                    passEle.setAttribute('src', 'images/show-pass-icon.png');
                    passEle.style.width = '33px';
                    passEle.style.height = '23px';
                    passInput.type = 'text';
                }, 500);
            }
        }

        const changeLogin = (ele) => {
            if (!batchesData){
                Alert('error','Something went wrong. Please try again later !')
            }else{
                const adminLoginEle = document.querySelector('.admin-login-div');
                const stdLoginEle = document.querySelector('.std-login-div');
                const adminIcon = document.querySelector('.admin-login-icon');
                const stdIcon = document.querySelector('.std-login-icon');
                if (ele === 'admin') {
                    adminLoginEle.style.left = '-550px';
                    stdLoginEle.style.right = '0';
                    adminIcon.style.left = '-550px';
                    stdIcon.style.right = '0';
                } else if (ele === 'student') {
                    adminLoginEle.style.left = '0';
                    stdLoginEle.style.right = '-550px';
                    adminIcon.style.left = '0';
                    stdIcon.style.right = '-550px';
                }
                document.querySelector('.password-input').value = "";
                document.querySelector('.email-input').value = "";
                document.querySelector('.std-batch-selection').value = 'select';
                document.querySelector('.std-email-input').value = "";
            };
        };

        const checkAdmin = () => {
            const email = document.querySelector('.email-input').value;
            const password = document.querySelector('.password-input').value;
            if ((loginData && loginData.length === 0) && password === 'Create Super User' && email.length > 0){
                return email;
            }
            for (const data of loginData) {
                if (data.Email === email || data.Username === email){
                    if (data.Password === password){
                        localStorage.setItem('LoginUserId',JSON.stringify(data.id));
                        return true;
                    } else {
                        return false;
                    };
                }
            };
            return false;
        };

        const sendOTP = (event) => {
            event.preventDefault();
            if (!batchesData){
                Alert('error','Something went wrong. Please try again later !')
            }else{
                const forgotUserName = document.querySelector('.forgot-username-opt');
                const usernameInput = document.querySelector('.forgot-username-input');
                if(forgotUserName.checked || usernameInput){
                    const email = document.querySelector('.forgot-email-input');
                    const username = document.querySelector('.forgot-username-input');
                    const sendOTPBtn = document.querySelector('.forgot-sumbit-btn');
                    sendOTPBtn.style.width = '50px';
                    sendOTPBtn.style.color = 'transparent';
                    setTimeout(()=>{
                        sendOTPBtn.style.borderRadius = '50%';
                    },200)
                    setTimeout(()=>{
                        sendOTPBtn.classList.add('submit-btn-rotate')
                        setTimeout(()=>{
                            setTimeout(()=>{
                                sendOTPBtn.classList.remove('submit-btn-rotate')
                                sendOTPBtn.style.borderRadius = '10px';
                                sendOTPBtn.style.width = '82%';
                                sendOTPBtn.style.color = '#ffff';
                            },3000);
                                if (sendOTPBtn.value === 'Send Username'){
                                    const data = loginData && loginData.find((data)=>data.Email === email.value);
                                    if (data){
                                        sendMail(data,data.Email,data.Username,'Username');
                                    }else{
                                        Alert('error','Email address not found. Please check the email you entered<br/>and try again !');
                                    }
                                }else{
                                    const data = loginData && loginData.find((data)=>data.Email === email.value && data.Username === username.value);
                                    if (data){
                                        const otp = Math.floor(100000 + Math.random() * 900000);
                                        setOTP(otp);
                                        sendMail(data,data.Email,otp,'OTP');
                                    }else{
                                        Alert('error','Invalid username or email address !')
                                    }
                                };
                        },3000)
                    },400)
                }else{
                    Alert('error','Please enter a value in the input field !')
                };
            }
        };

        const sendMail = async (data,mail,user,mailtype) => {
            Alert('warning','Sending OTP. Please wait...');
            const password = document.querySelector('.password-input');
            const email = document.querySelector('.email-input');
            const emailOptDiv = document.querySelector('.email-otp-div');
            const passwordDiv = document.querySelector('.reset-password-div');
            const mailData = {
                Email : mail,
                OTP : `${user} ${mailtype}`,
            };
            try {
                let res = await axios.post('https://vcubeapi.pythonanywhere.com/api/send-otp/', JSON.stringify(mailData), {
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });
            if (res.status === 200 || res.status === 201){
                if (mailtype === 'Username'){
                    Alert('success','Your Username has been successfully sent to your email address !<br/>Also check spam folder if not found !');
                    forgotDivClose('close');
                }else if (mailtype === 'OTP'){
                    Alert('success','OTP has been successfully sent to your email address !<br/>Also check spam folder if not found !');
                    setUserForgotDetail(data);
                    emailOptDiv.style.marginLeft = '-450px';
                    passwordDiv.style.right = '0';
                }else if (mailtype === 'User_OTP'){
                    Alert('success','Enter OTP sent to the Admin email address to add user !<br/>Also check spam folder if not found !');
                    const docEle = document.querySelector('.user-create-container')
                    docEle.style.visibility = 'visible';
                    docEle.style.opacity = '0';
                    setTimeout(()=>{
                        docEle.style.transition = '0.5s ease-in-out';
                        docEle.style.opacity = '1';
                    },100);
                    document.querySelector('.user-c-username').value = email.value;
                    password.value = "";
                    email.value = "";
                }else if (mailtype === 'Std_Login_OTP'){
                    Alert('success','OTP has been successfully sent to your email address !<br/>Also check spam folder if not found !');
                    stdChkOTP();
                    setUserLO(true);
                };
            };
            } catch (error){
                setTimeout(()=>{
                    if (mailtype === 'Username'){
                        Alert('error','There was an error sending the email. Please try again later !');
                    }else{
                        Alert('error','There was an error sending the OTP. Please try again later !');
                    }   
                },2100);         
            }
        };

        const updatePassword = async (data,email,newPassword) => {
            const loginData = {
                id : data.id,
                Username : data.Username,
                Email : email,
                Password : newPassword
            }
            try{
                let res = await axios.put('https://vcubeapi.pythonanywhere.com/api/login/', JSON.stringify(loginData), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success','Your Password had been updated successfully !');
                    forgotDivClose('close');
                }
            }catch (error){
                Alert('error','There was an error in updating password. Please try again later !');
            };
        };

        const forgotDivClose =(status)=> {
            const mainDiv = document.querySelector('.forgot-password-div');
            const blurDiv = document.querySelector('.blurdiv');
            const emailOptDiv = document.querySelector('.email-otp-div');
            const passwordDiv = document.querySelector('.reset-password-div');
            const inputEles = ['forgot-username-input','forgot-email-input','OTP-input','forgot-password-input','forgot-cfrm-password-input']
            if (status === 'close'){
                mainDiv.style.opacity = '0';
                setTimeout(()=>{
                    mainDiv.style.visibility = 'hidden';
                    blurDiv.style.visibility = 'hidden';
                    emailOptDiv.style.marginLeft = '0';
                    passwordDiv.style.right = '-450px';
                    document.querySelector('.forgot-username-checkbox').checked = false;
                    forgot_UserName();
                    inputEles.forEach((ele)=>{
                        document.querySelector(`.${ele}`).value = '';
                    })
                },500)
            }else if (status === 'open'){
                mainDiv.style.opacity = '1';
                mainDiv.style.visibility = 'visible';
                blurDiv.style.visibility = 'visible';
            }
        };

        const forgot_UserName = () => {
            const submitBtn = document.querySelector('.forgot-sumbit-btn');
            const userInput = document.querySelector('.forgot-username-input');
            const userChkbox = document.querySelector('.forgot-username-checkbox');
            if (submitBtn.value === 'Send OTP' && userChkbox.checked){
                submitBtn.value = 'Send Username';
                userInput.disabled = true;
                userInput.required = false;
                userInput.style.opacity = 0.5;
            } else {
                submitBtn.value = 'Send OTP';
                userInput.required = true;
                userInput.disabled = false;  
                userInput.style.opacity = 1;        
            }
        };

        const checkOTP =(event)=>{
            event.preventDefault();
            const otpEle = document.querySelector('.OTP-input');
            const passEle = document.querySelector('.forgot-password-input');
            const Con_PassEle = document.querySelector('.forgot-cfrm-password-input');
            const passSubmitBtn = document.querySelector('.password-submit-btn');
            passSubmitBtn.style.width = '50px';
            setTimeout(()=>{
                passSubmitBtn.classList.add('submit-btn-rotate')
                setTimeout(()=>{
                    if (parseInt(otpEle.value) === userOTP){
                        if (passEle.value === Con_PassEle.value){
                            const data = userForgotDetail;
                            updatePassword(data,data.Email,Con_PassEle.value);
                            forgotDivClose('close');
                        }else{
                            Alert('error','Password does not matched !')
                        }
                    }else{
                        Alert('error','OTP entered does not match. Please ensure you have entered the correct OTP.')
                    };
                    passSubmitBtn.classList.remove('submit-btn-rotate')
                    passSubmitBtn.style.width = '82%';
                },3000)
            },500)
        };

        const closeUserCreateDiv = () =>{
            const inputEle = document.querySelectorAll('.user-create-Form input');
            const inputEles = Array.from(inputEle);
            inputEles.forEach((ele,index)=>{
                if (index <= 4){
                    ele.value = "";
                };
            });
            const docEle = document.querySelector('.user-create-container');
            docEle.style.opacity = '0';
            setTimeout(()=>{
                docEle.style.visibility = 'hidden';
                document.querySelector('.blurdiv').style.visibility = 'hidden';
            },500);
        };

        const submitCreateUser = (e) => {
            e.preventDefault();
            const userName = document.querySelector('.user-c-username');
            const email = document.querySelector('.user-c-email');
            const password = document.querySelector('.user-c-password');
            const cnfPass = document.querySelector('.user-c-cnf-pass');
            const otp = document.querySelector('.user-c-otp');
            if (parseInt(otp.value) === userOTP){
                if (password.value === cnfPass.value){
                    const newUserData = {
                        Username : userName.value,
                        Email : email.value,
                        Password : password.value,
                        User : 'Super Admin',
                        Permission : 'Granted',
                        Class : 'All'
                    };
                    addUserLoginData(newUserData);
                }else{
                    Alert('error',"Password does not match. Check and try again !");
                };
            }else{
                Alert('error','Invalid OTP. Check and try again !');
            };
        };

        const addUserLoginData = async (data) => {
            try{
                let res = await axios.post('https://vcubeapi.pythonanywhere.com/api/login/', JSON.stringify(data), {
                headers: {
                'Content-Type': 'application/json',
                },
            });
            if (res.status === 200 || res.status === 201){
                Alert('success','New User has been added successfully !');
                closeUserCreateDiv();
                getLoginData();
            }
            }catch (error){
                Alert('error','Unfortunately, the new user addition was unsuccessful. Try again later ! ');
            }
        };

        const stdChkOTP = () => {
            document.querySelector('.std-selection-batch-label').innerHTML = `
            <img src="images/otp-icon.png" width="30px" />
            <input class='std-login-input' type="number" placeholder="Enter OTP" style="width: 101%; height: 40px; font-size: 20px; border: none; border-bottom: solid 1px grey; outline: none;" />
        `;
        };

        const chkStdBatch = (e) => {
            if (cls === "" && document.querySelector('.std-email-input').value === ""){ 
                e.stopPropagation();
                Alert('error','Enter Phone or Email to show batches !')
            };
        };

        const onHoverEmoji = (num,leave=false,click=false) => {
            if(click){
                setClicked(true);
                setClickedNo(num);
            }
            const colors = ['red','#ee603b','#f58b39','#fcad36','#ffc929','#f9de1c','#d5d73d','#b0d258','#89c973','#00924c'];
            if(leave && !clicked){
                colors.forEach((color,index)=>{
                    if (index < num){
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.background = 'lightgrey';
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px lightgrey`;
                    };
                });
            }else if(leave && clicked){
                colors.forEach((color,index)=>{
                    if (index >= clickedNo){
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.background = 'lightgrey';
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px lightgrey`;
                    };
                });
            }else{
                colors.forEach((color,index)=>{
                    if (index < num){
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.background = color;
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px ${color}`;
                    }else if(click){
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.background = 'lightgrey';
                        document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px lightgrey`;
                    };
                });
            }
        };

        const onHoverEmojiTxt = (num,leave=false) => {
            const colors = ['red','#ee603b','#f58b39','#fcad36','#ffc929','#f9de1c','#d5d73d','#b0d258','#89c973','#00924c'];
            const moves = [-3, 3, 18, 31.7, 38.3, 46.5, 60, 65.3, 77.7, 89];
            const names = ["Unacceptable", "Needs Improvement", "Satisfactory", "Good", "Impressive", "Remarkable", "Superb", "Extraordinary", "Perfection", "Ultimate"];
            const spanEle = document.querySelector('.emoji-names');
                if(leave){
                    spanEle.style.display = 'none';
                }else{
                    spanEle.style.display = '';
                    spanEle.style.left = `${moves[num - 1]}%`;
                    spanEle.style.color = colors[num - 1];
                    spanEle.textContent = names[num - 1];
                };
        };

        const submit_U_R = () => {
            const cnt = (clickedNo > 0) ? clickedNo : 0;
            const names = ["Unacceptable", "Needs Improvement", "Satisfactory", "Good", "Impressive", "Remarkable", "Superb", "Extraordinary", "Perfection", "Ultimate"];
            if (cnt > 0){
                const no = (cnt === 0) ? 1 : cnt - 1;
                const r_txt = document.querySelector('.U_R_Txt').value;
                const txt = (r_txt.length > 3) ? r_txt : 'No Text Review Provided';
                const data = loginData && loginData.find(data=>data.Username === lg_User.split('&')[1] && data.Email === lg_User.split('&')[2]);
                data.Permission = (data.Permission === 'Granted') ? 'Granted~' : 'Denied~';
                sendStdAlert('ahammada587@gmail.com','User_Review',`${lg_User.split('&')[1]}~${lg_User.split('&')[2]}~${cnt}~${names[no]}~${txt}~`,data);
                setReview(false);
                closeRatingDiv(true);
                setClickedNo(0);
            }else{
                Alert('error','Please select a rating from 1 to 10 to provide your review !');
            };
        };

        const closeRatingDiv = (nope) =>{
            const divEle = document.querySelector('.Rating-User-div');
            divEle.style.opacity = '0';
            divEle.style.visibility = 'hidden';
            divEle.style.zIndex = '-10';
            document.querySelector('.blurdiv').style.visibility = 'hidden';
            if (!nope){
                Alert('error','Ratings provide valuable feedback that motivates us to deliver an even better experience.<br/>So we kindly request that you take a moment to share your rating.',10000);
            };
            sessionStorage.setItem('UserLogout','False');
        };

        const chckStdP_E = (e) => {
            if(e.target.value === ""){
                sessionStorage.setItem('std_cls',JSON.stringify(""));
                setCls("");
            };
            studentsData.forEach(data=>{
                if (data.Phone === e.target.value || data.Email === e.target.value){
                    sessionStorage.setItem('std_cls',JSON.stringify(data.Class));
                    setCls(data.Class);
                };
            });
        };

        return (
            <div>
                <img className="screen-size-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
                <div className="Login-Page-Container">
                    <div className="main-login-container" data-login-type="" >
                        <div className="inner-login-div">
                            <div className="login-form-left-div">
                                <img src="images/V-CUBE-Logo.png" className="login-Favicon" />
                                <div>
                                    <img className="admin-login-icon" src="images/admin-login.gif" width="100px" />
                                    <img src="images/std-login-icon.png" className="std-login-icon"/>
                                </div>
                            </div>
                            <div className="login-form-right-div">
                                <div className="admin-login-div">
                                    <span className="login-profile-icon-btn">
                                        <button className="login-profile-btn-1"></button>
                                        <button className="login-profile-btn-2"></button>
                                    </span>
                                    <label>
                                        <img src="images/login-username-icon.png" width="20px" />
                                        <input className="email-input" type="text" placeholder="Username or Email" />
                                    </label>
                                    <label>
                                        <img src="images/security-icon.png" width="20px" />
                                        <input className="password-input" type="password" placeholder="Password" />
                                        <img src="images/hide-pass-icon.png" className="pass-show" onClick={showPassword} />
                                    </label>
                                    <span className="std-login" onClick={() => changeLogin('admin')}>Student Login</span>
                                    <button className="admin-login-btn" onClick={()=>btnRotate('Admin')}>Login</button>
                                    <p className="forgot-password" onClick={()=>forgotDivClose('open')}>Forgot Password ?</p>
                                </div>
                                <div className="std-login-div">
                                    <span className="login-profile-icon-btn">
                                        <button className="login-profile-btn-1"></button>
                                        <button className="login-profile-btn-2"></button>
                                    </span>
                                    <label>
                                        <img src="images/login-username-icon.png" width="20px" />
                                        <input type="text" placeholder="Email or Phone" className="std-email-input" onChange={(e)=>chckStdP_E(e)}/>
                                    </label>
                                    <label className="std-selection-batch-label">
                                        <img src="images/std-batch-icon.png" width="28px" />
                                        <select className="std-batch-selection" onClick={chkStdBatch}>
                                            <option value="select" style={{ visibility: 'hidden' }} >Select Batch</option>
                                            {batchesData && batchesData.map(data=>{
                                                if(data.Class === JSON.parse(sessionStorage.getItem('std_cls'))){
                                                return(
                                                    <option value={data.BatchName} style={{fontSize : '23px'}}>{data.BatchName}</option>
                                                    )
                                                }
                                            })}
                                        </select>
                                    </label>
                                    <span className="admin-login" onClick={() => changeLogin('student')}>Admin Login</span>
                                    <button className="std-login-btn" onClick={() => btnRotate('Student')}>Login</button>
                                    <span className="std-login-error-msg" style={{ color: 'red', marginTop: '15px', visibility : 'hidden' }}>Visit for <a href="https://www.vcubesoftsolutions.com/" target="main">Assistance</a></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="user-create-container">
                        <div className="forgot-pass-img-div">
                            <button id="forgot-pass-btn1"></button>
                            <button id="forgot-pass-btn2"></button>
                        </div>
                        <form action="" className="user-create-Form" onSubmit={(e)=>submitCreateUser(e)}>
                            <input className="user-c-username" type="text" placeholder="Username" required />
                            <input className="user-c-email" type="email" placeholder="Email" required />
                            <input className="user-c-password" type="text" placeholder="Password" required />
                            <input className="user-c-cnf-pass" type="password" placeholder="Confirm Password" required />
                            <input className="user-c-otp" type="number" placeholder="OTP" required />
                            <input type="submit" style={{background : '#616bf1', border : 'none', color : '#fff', borderRadius : '5px', height : '40px',cursor : 'pointer'}}/>
                        </form>
                        <span className="create-user-x" onClick={closeUserCreateDiv}>&times;</span>
                    </div>
                    <div className="forgot-password-div">
                        <div className="forgot-pass-img-div">
                            <button id="forgot-pass-btn1"></button>
                            <button id="forgot-pass-btn2"></button>
                        </div>
                        <div className="main-email-opt-div">
                        <div className="email-otp-div">
                            <form action="" onSubmit={(event)=>sendOTP(event)}>
                                <input className="forgot-username-input" type="text" placeholder="Username" required/>
                                <input className="forgot-email-input" type="email" placeholder="Email" required/>
                                <input className="forgot-sumbit-btn" type="submit" value="Send OTP"/>
                                <span className="forgot-username-opt"><input type="checkbox" className="forgot-username-checkbox" onClick={forgot_UserName}/>&nbsp; Forgot Username ?</span>            
                            </form>
                        </div>
                        <div className="reset-password-div">
                            <form action="" onSubmit={(event)=>checkOTP(event)}>
                                <input className="OTP-input" type="number" placeholder="Enter OTP" required></input>
                                <input className="forgot-password-input" type="password" placeholder="Password" required></input>
                                <input className="forgot-cfrm-password-input" type="text" placeholder="Confirm Password" required></input>
                                <input className="password-submit-btn" type="submit" value="Submit"></input>
                            </form>
                        </div>
                        </div>
                        <span className="x-span" onClick={()=>forgotDivClose('close')}>&times;</span>
                    </div>
                    <div className="Rating-User-div" style={{zIndex : (review === true) ? '110' : '-10',visibility : (review === true) ? 'visible' : 'hidden',opacity : (review === true) ? '1' : '0'}}>
                        <h1>Give Us Your Thoughts</h1>
                        <div className="emojis-div">
                            {[1,2,3,4,5,6,7,8,9,10].map(num=>(
                                <div className={`emoji-img-div emoji-img-div-${num}`} onMouseOver={()=>{onHoverEmoji(num);onHoverEmojiTxt(num)}} onMouseLeave={()=>{onHoverEmoji(num,true);onHoverEmojiTxt(num,true)}} onClick={()=>onHoverEmoji(num,false,true)}><img src={`images/emoji-${num}.png`}/></div>
                            ))}
                            <span className="emoji-names"></span>
                        </div>
                        <textarea className="U_R_Txt" placeholder="Feedback & Suggestions (Optional)"></textarea>
                        <button onClick={submit_U_R}>Submit Review</button>
                        <span className="X-icon" onClick={()=>closeRatingDiv(false)}>&times;</span>
                    </div>
                    <div className="blurdiv"></div>
                    <div className="alert-div">
                    <img className="alert-div-img" src="" alt="" width="40px"/>
                        <p></p>
                        <span className="X" onClick={closeAlert}>&times;</span>
                    <div className="alert-timer-line"></div>
            </div>
                </div>
            </div>
        );
    };
};

export default Login;
