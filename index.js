const express = require('express') ;
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require("body-parser");
const { response } = require('express');
const saltRounds = 10
const { name } = require('ejs');
const bcrypt = require('bcrypt');
const cookieParser=require('cookie-parser');
const session = require('express-session');

app.use(cors({
    origin:["http://localhost:3000"],
    methods:["GET","POST","PUT"],
    credentials:true     
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json())
app.use(cookieParser());
app.use(session({
    key:"employee_id",
    secret:"subscribe",
    resave:false,
    saveUninitialized:false,
    cookie:{
     expires:60*60*24,
    },
  }));
app.set("view engine","ejs");



const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "", 
    database: "eut_furnitures",
    multipleStatements:true

})

        // LOG IN SESSION
app.get("/login",(req,res)=>{
    if(req.session.user){
      res.send({loggedIn:true,user:req.session.user});
    }else{
      res.send({loggedIn:false});
    }
   });
     
        // LOG INTO THE SYSTEM
app.post('/login',(req,res)=>{
  
    const email = req.body.email;
    const password = req.body.password;
   
    db.query(
        "SELECT *FROM employee WHERE email=? ;",
       email,
        (err,result)=>{
            console.log(result)
            
            
            if(err)
            { 
                res.send({err:err})
            } 
            if(result.length > 0){
                
             if(password==result[0].password) {
               req.session.user=result;
                console.log(req.session.user);    
                   res.send(result);
                  }
                  else{
                   
                   res.send({message:"Invalid Username or Password"});
                  
                  }
              }
           })
          
        });


 
  // INSERT RETURN ITEMS
app.post('/create', (req, res) => {
    console.log(req.body);
  
    const order_id = req.body.order_id;
    const product_id = req.body.product_id;
    const return_date = req.body.return_date;
    const reason = req.body.reason;

    db.query("INSERT INTO return_item ( order_id, product_id, return_date, reason) VALUES (?,?,?,?)" ,
     [ order_id, product_id, return_date, reason],
      (err,result) => {
          if(err){
          console.log(err)
          }else {
              res.send(result)
          }
     });
});

    //UPDATE RETURN ITEMS
  app.put('/updateReturn/:order_id', (req,res) => {

    const order_id = req.params.order_id;
    const product_id = req.body.product_id;
    const return_date = req.body.return_date;
    const reason = req.body.reason;
    const sqlUpdate = "UPDATE   return_item   SET product_id=?, return_date=?, reason=? WHERE order_id = ?";
  
    db.query(sqlUpdate,[product_id, return_date,reason,order_id],(err,result)=>{
      if(err) console.log(err);
    })
  });
 
  //UPDATE DELIVERY STATUS
  app.put('/confirmdelivery/:order_id', (req,res) => {

    const order_id = req.params.order_id;
    const o_status = req.body.o_status;

    const sqlUpdates = "UPDATE orders  SET o_status =?  WHERE order_id = ?";
  
    db.query(sqlUpdates,[o_status,order_id],(err,result)=>{
      if(err) console.log(err);
    })
  });

   // VIEW DELIVERY TO CHANGE ORDER_STATUS
  app.get('/ConfirmDeliveryFetch', (req, res) => {
    db.query("SELECT  * FROM orders WHERE order_id=?",[req.query.order_id], (err, results, fields) => {
       if(err) throw err;
       res.send(results);
     });
    
   });



    // VIEW RETURN ITEMS
app.get("/returnItem", (req, res) => {
    const sqlSelect = "SELECT * FROM return_item";
        db.query(sqlSelect, (err, result) => {
            res.send(result);
        } 
       
    );
    });



     // VIEW CASH ON DELIVERIES TO CONFIRM
app.get("/viewcashOnDelivery", (req, res) => {
   const sql_Select = " SELECT orders.order_id, orders.total_price, orders.advance_price, payment.payment_status FROM orders LEFT JOIN payment ON orders.order_id = payment.order_id  WHERE payment_method = 'cash on delivery'";
   db.query(sql_Select, (err, result) => {
    res.send(result);
    } 
    );      
    });

        // VIEW AVAILABLE DELIVERIES
 app.get("/viewAvailableDelivery", (req, res) => {
        const sql_View = "SELECT orders.order_id, orders.employee_id, orders.order_last_date,customer.address,customer.fname, customer.phone  FROM orders LEFT JOIN customer ON orders.customer_id=customer.customer_id    ";
        db.query(sql_View, (err, result,fields) => {
            res.send(result);
        } 
        );      
        });

       // VIEW  DELIVERY TO CONFIRM
app.get("/viewConfirmDelivery", (req, res) => {
            const sql_condelivery = " SELECT order_id, o_status FROM orders  ";
            db.query(sql_condelivery, (err, result) => {
             res.send(result);
             } 
             );      
             });


        
   //VIEW RETURN ITEMS INFO
  app.get('/ReturnItemview', (req, res) => {
    db.query("SELECT * FROM return_item WHERE order_id=?",[req.query.order_id], (err, results, fields) => {
       if(err) throw err;
       res.send(results);
     });
    
   });

//  VIEW EMPLOYEE

   app.get('/employee', (req, res) => {
    db.query("SELECT * FROM employee WHERE employee_id=?",[req.query.employee_id], (err, results, fields) => {
       if(err) throw err;
       res.send(results);
     });
    
   });



app.get('/dpprofile/:employee_id', (req, res) => {
    employee_id=req.params.employee_id;
    db.query("SELECT * FROM employee WHERE employee_id=? ",[req.query.employee_id], (err, results, fields) => {
       if(err) throw err;
       res.send(results);
     });
   console.log(req.query.employee_id);
   });

   //       VIEW RETURN ITEM DETAILS
   app.get("/ReturnedDetails",(req,res)=>{
    order_id=req.params.order_id;
    db.query("SELECT order_id, employee_id,return_date,reason,product_id FROM return_item WHERE order_id=?",[req.query.order_id],(err,result)=>{
        console.log(req.query.order_id);
        res.send(result);
    });
        
});

    //VIEW DELIVERY DETAILS
app.get("/DeliveryDetails",(req,res)=>{
    order_id=req.params.order_id;
    db.query("SELECT *  FROM orders    WHERE order_id=? ",[req.query.order_id],(err,result)=>{
        console.log(req.query.order_id);
        res.send(result);
    });
        
});
//DELETE RETURN ITMES

app.delete("/deleteReturnitem/:order_id",(req,res)=>{
    const order_id = req.params.order_id;
    const sqlDelete="DELETE FROM return_item WHERE order_id=?";

    db.query(sqlDelete,order_id,(err,result)=>{
      if(err) console.log(err);
    });
  });



//DELIVERY MANAGER

app.get("/delivers", (req, res) => {
    db.query("SELECT * FROM employee WHERE role='Delivery Person' ", (err, result, fields) => {
        if (err) {
            console.log(err);
        } else{
            res.send(result);
        }
    });
});


app.get("/viewReturn", (req, res) => {
    db.query("SELECT order_id,employee_id,return_date,reason,reschedule_date,return_status FROM return_item ORDER BY order_id DESC", (err, result, fields) => {
        if (err) {
            console.log(err);
        } else{
            res.send(result);
        }
    });
});

//CUSTOMER
app.get('/customer', (req, res) => {
    db.query("SELECT * FROM customer WHERE customer_id=?",[req.query.customer_id], (err, results, fields) => {
       if(err) throw err;
       res.send(results);
     });
    
   });



app.post("/register",(req,res) => {
    const fname=req.body.fname;
    const lname=req.body.lname;
    const email=req.body.email;
    const phone=req.body.phone;
    const address=req.body.address;
    const password=req.body.password;
    const cpassword=req.body.cpassword;
   
  
   if(password == cpassword){
    
     db.query(
         "INSERT INTO customer(fname,lname,email,phone,address,password,proimg) VALUES (?,?,?,?,?,?,'/user.jpg')",[fname,lname,email,phone,address,password],
         (err,result) =>{
             if(err){
                 console.log(err)
             }else{
                 res.send({message:"values sended"});
             }
         }
         );
     }
     else{
         res.send({message:"check password"})
     }
       
  }); 



  app.post('/loginc',(req,res)=>{
 
    const email = req.body.email;
    const password = req.body.password;
   
    db.query(
        "SELECT *FROM customer WHERE email=?;",
       email,
        (err,result)=>{
            console.log(result)
            
            
            if(err)
            { 
                res.send({err:err})
            } 
            if(result.length > 0){
                
             if(password==result[0].password) {
                   req.session.user=result;
                  // console.log(req.session.user);   
                   res.send(result);
                  }
                  else{
                   
                   res.send({message:"Invalid Username or Password"});
                  
                  }
              }
           })
          
        });
app.listen(3001,  () => {
    console.log("Hi Your Server is connected!");

});
