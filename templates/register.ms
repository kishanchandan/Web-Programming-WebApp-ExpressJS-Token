<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/css/style.css">
  </head>
    <body>
      <h1>Registration Page</h1>
      <h2>Please fill the registration page.</h2>
      <p class="error">{{msg}}</p>
      <form action="register.html" method="post">
        <fieldset>
          <label for="firstname">First Name</label>
          <input type="text" required="" name="firstname" placeholder="First Name" value="{{formvalues.fname}}"><br>
          <label for="lastname">Last Name</label>
          <input type="text" required="" name="lastname" placeholder="Last Name" value="{{formvalues.lname}}"><br>
          <label for="email">Email</label>
          <input type="text" required="" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$" name="email" placeholder="Email" value="{{formvalues.email}}"><br>
          <label for="password">Password</label>
          <input type="password" pattern="(?=.*\d)(?=.*[a-z]).{8,}" required="" name="password" placeholder="Password"><br>
          <label for="passwordconfirmation">Re-type Password</label>
          <input type="password" required="" name="passwordconfirmation" pattern="(?=.*\d)(?=.*[a-z]).{8,}"  placeholder="Retype Password"><br>
          {{#errors}}<span class="error">{{errors.qError}}<br></span>{{/errors}}
          <div class="form__submit-button">
              <input name="submit" type="submit" value="Register" class="control">
              </br><p><a href="/login.html">Login Here</a></p>
              
          </div>
        </fieldset>
      </form>
    </body>
</html>