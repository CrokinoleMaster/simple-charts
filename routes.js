var passport = require('passport');
var Account = require('./models/account');
var Chart = require('./models/chart');

module.exports = function (app) {

  app.get('/', function (req, res) {
    if (req.user){
      Chart.find({username: req.user.username}, function(err, docs) {
        res.render('index', { user : req.user, charts: docs});
      });
    } else {
      res.render('index');
    }
  });

  app.get('/register', function(req, res){
    res.render('register');
  })

  app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
      if (req.xhr){
        if (err) {
          return res.json({error: 'Sorry. That username is taken.'});
        }
        passport.authenticate('local')(req, res, function() {
          res.json({user: {
            id: req.user.id
          }, success: true});
        })
      } else {
        if (err) {
            return res.render('register', {info: 'Sorry. That username is taken.'});
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
      }
    });
  });

  app.get('/login', function(req, res) {
      res.render('login', { user : req.user });
  });

  app.post('/login', function(req, res) {
    passport.authenticate('local', function(err, user) {
      if (req.xhr) {
        if (err)   { return res.json({error: err.message }); }
        if (!user) { return res.json({error : "Invalid Login"}); }
        req.login(user, {}, function(err) {
          if (err) { return res.json({error:err}); }
          return res.json(
            { user: {
                      id: req.user.id
              },
              success: true
            });
        });
      } else {
        if (err)   { return res.redirect('/login'); }
        if (!user) { return res.redirect('/login'); }
        req.login(user, {}, function(err) {
          if (err) { return res.redirect('/login'); }
          return res.redirect('/');
        });
      }
    })(req, res);
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/projects/new', function(req, res) {
    if (req.user){
      new Chart({ username: req.user.username, name: req.body.name, data: req.body.data })
      .save(function(err, entr) {
        if (err){
          console.log(err);
          res.send(500, { error: err.toString()});
        } else {
          console.log('saved');
          res.json({success: 'saved'})
        }
      });
    } else {
      res.json({error: 'not logged in'});
    }
  });

  app.get('/projects/data/:name', function(req, res) {
    if (req.user){
      Chart.findOne({ username: req.user.username, name: req.params.name}, function(err, docs) {
        if (err) {
          res.send(500, {error: err.toString()});
        } else {
          res.json({data: docs.data});
        }
      });
    } else {
      res.json({error: 'not logged in'});
    }
  });

  app.del('/projects/:name', function(req, res) {
    if (req.user){
      Chart.findOne({ username: req.user.username, name: req.params.name}, function(err, docs) {
        if (err) {
          res.send(500, {error: err.toString()});
        } else {
          docs.remove();
          res.send(200);
        }
      });
    } else {
      res.json({error: 'not logged in'});
    }
  })


};
