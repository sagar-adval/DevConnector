import React, { Fragment, useState } from 'react'
import {Link} from "react-router-dom";

const Register = () => {

    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      verifyPassword: ''
    });

    const {name, email, password, verifyPassword} = formData;

    const onSubmit = (e) => {
      e.preventDefault();
      if(password != verifyPassword){
        console.log('Passwords do not match!');
      }
      else
      {
        console.log(formData);
      }
    }

    return (
        <Fragment>
            <h1 className="large text-primary">Sign Up</h1>
      <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input type="text" placeholder="Name" name="name" value = {name} onChange={e => setFormData({...formData, [e.target.name]:e.target.value})} required />
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email Address" name="email" value = {email} onChange={e => setFormData({...formData, [e.target.name]:e.target.value})}/>
          <small className="form-text"
            >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small
          >
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value = {password}
            onChange={e => setFormData({...formData, [e.target.name]:e.target.value})}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="verifyPassword"
            minLength="6"
            value = {verifyPassword}
            onChange={e => setFormData({...formData, [e.target.name]:e.target.value})}
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account ? <Link to = "/login">Sign In</Link>
      </p>
        </Fragment>
    )
};

export default Register
