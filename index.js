const express = require('express') ;
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require("body-parser");
const { response } = require('express');
const saltRounds = 10
const { name } = require('ejs');
const bcrypt = require('bcrypt');
app.use(bodyParser.json());
app.use(cors());
app.use(express.json())
app.set("view engine","ejs");

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "", 
    database: "eut_furniture",
    multipleStatements:true

})

app.post('/login', (req, res) => {

	const email = req.body.email
	const password = req.body.password
    
    console.log(email)
    console.log(password)
	db.query
	("SELECT * FROM users WHERE email = ?;", 
	email, 
	(err, result)=> {

		if(err){
			res.send({err: err})
		}
        if(result){
			if (result.length > 0) {
				bcrypt.compare(password, result[0].password, (err, response)=>{
					if(response){
						res.send(result)
					}else{
						res.send({message:"Invalid Username or Password!"})
					}
				})
			}else{
				res.send({message:"User doesn't exist"});
			}

            
		}}
	);
});
 
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


app.get("/get", (req, res) => {
    const sqlSelect = "SELECT * FROM return_item";
        db.query(sqlSelect, (err, result) => {
            res.send(result);
        } 
       
    );
    });


app.put("/update_return",  (req, res) => {
    const order_id = req.body.order_id;
    const product_id = req.body.product_id;
    const return_date = req.body.return_date;
    const reason = req.body.reason;
    db.query (
        "UPDATE SET return_item product_id = ?,order_id = ?, return_date = ? , reason = ?   WHERE order_id = ? " ,
        [ order_id, product_id, return_date, reason],
        (err, result) => {
            if(err){
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.get("/viewcashOnDelivery", (req, res) => {
   const sql_Select = " SELECT order_id, total_price, advance_price, o_status FROM orders";
   db.query(sql_Select, (err, result) => {
    res.send(result);
    } 
    );      
    });
app.get("/viewAvailableDelivery", (req, res) => {
        const sql_View = "SELECT orders.order_id,orders.order_last_date,customer.c_address,customer.c_name, customer.c_phone_no FROM orders LEFT JOIN customer ON orders.customer_id=customer.customer_id ";
        db.query(sql_View, (err, result,fields) => {
            res.send(result);
        } 
        );      
        });
 
app.get("/viewConfirmDelivery", (req, res) => {
            const sql_condelivery = " SELECT delivery_id, order_id FROM delivery ";
            db.query(sql_condelivery, (err, result) => {
             res.send(result);
             } 
             );      
             });
        



app.post('/create', (req,res) => {
    const name = req.body.name;
    const age = req.body.age;
    const address = req.body.address;
    const orders = req.body.orders;
    const loyalty = req.body.loyalty;  

    db.query('INSERT INTO customers (name, age, address, orders, loyalty) VALUES (?,?,?,?,?)', 
    [name, age, address, orders, loyalty], (err, result) => {
        if (err) {
            console.log(err)
        } else{
            res.send("Values Inserted")
        }
      }
    );
});

app.get('/customers',(req,res) => {
    db.query('SELECT * FROM customers', (err, result) => {
        if(err) {
            console.log(err)
        }else {
            res.send(result);
        }
    });
});

app.put('/update', (req,res) => {
    const id=req.body.id;
    const loyalty = req.body.loyalty;
    db.query("UPDATE customers SET loyalty = ? WHERE id = ?", 
    [loyalty, id], 
    (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
       }
    );
});

app.delete('/delete/:id', (req,res) => {
    const id = req.params.id
    db.query("DELETE FROM customers WHERE id = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        }else {
            res.send(result);
        }
    })
})


app.delete('/delete/:id', (req,res) => {
    const id = req.params.id
    db.query("DELETE FROM return_item WHERE order_id = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        }else {
            res.send(result);
        }
    })
})




app.listen(3003,  () => {
    console.log("Hi Your Server is connected!");

});
