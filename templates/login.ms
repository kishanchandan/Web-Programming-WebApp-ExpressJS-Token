<!DOCTYPE html>
<html>
  <head>
    <title>Login Page</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <h1>Login Here</h1>
    <p class="error">{{msg}}</p>
    <form method="GET" action="/login.html">
      <label for="email">Email</label>
      <input type="text" name="email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$" value="{{formvalues.email}}" placeholder="Email" required=""><br>
      <label for="password">Password</label>
      <input type="password" name="password" placeholder="Password" required=""><br>
      <input name="submit" type="submit" value="Login" class="control">
      {{#errors}}<span class="error">{{errors.qError}}<br></span>{{/errors}}
      </br><p><a href="/register.html">Register</a></p>
    </form> 
    
  </body>
</html>