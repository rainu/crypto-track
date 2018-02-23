"use strict";

const router = require('express').Router();
const formidable = require('formidable');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const Account = require('../model/account');
const Transaction = require('../model/transaction');
const Wallet = require('../model/wallet');
const Trade = require('../model/trade');
const importer = require('../import/backup');
const DBService = require('../db_service');

let lookLikeBackup = backup => {
  return backup && backup.username && backup.wallets
};

let backupPromise = req => {
  //we have two options:
  //* the json as request-body
  //* the json as file (multipart/fileupload)
  //each one must be handle differently!
  if(req.get("Content-Type").startsWith('multipart/form-data')) {
    // parse a file upload
    var form = new formidable.IncomingForm();

    return new Promise((resolve, reject) => {
      form.parse(req, function(err, fields, files) {
        if(err) {
          reject(err);
        }else{
          try {
            resolve(JSON.parse(fs.readFileSync(files.file.path, 'utf8')));
          }catch(err) {
            reject(err);
          }
        }
      });
    });
  }else{
    return new Promise((resolve, reject) => {
      if(lookLikeBackup(req.body)){
        resolve(req.body);
      }else{
        reject('Upload don\'t look like backup.');
      }
    });
  }
};

router.route('/backup/:username')
  .get((req, resp) => {
    Account.findOne({username: req.params.username}).then((account) => {
      if(account) {
        importer.export(req.params.username).then((result) => {
          resp.send(result);
        }, (err) => {
          resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
          resp.end();
        });
      }else{
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      }
    }, (err) => {
      resp.status(HttpStatus.NOT_FOUND);
      resp.end();
    });
  })
.put((req, resp) => {
    backupPromise(req).then(backup => {
      DBService.getCompleteAccount(req.params.username).then(account => {
        let p = [];

        for(let trade of account.trades){
          p.push(Trade.findByIdAndRemove(trade._id));
        }
        for(let wallet of account.wallets){
          p.push(Transaction.remove({
            $or: [{from: wallet.address}, {to: wallet.address}]
          }));
          p.push(Wallet.findByIdAndRemove(wallet._id));
        }
        p.push(Account.remove({username: req.params.username}));

        Promise.all(p).then((done) => {
          importer.import(backup).then(() => {
            resp.status(HttpStatus.CREATED);
            resp.send();
          }, (err) => {
            resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
            resp.end();
          });
        }, err => {
          resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
          resp.end();
        });
      }, err => {
        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
    }, err => {
      resp.status(HttpStatus.BAD_REQUEST);
      resp.end();
    });
  });

router.route('/backup')
  .post((req, resp) => {
    backupPromise(req).then(backup => {
      importer.import(backup).then(() => {
        resp.status(HttpStatus.CREATED);
        resp.send();
      }, (err) => {
        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
    }, err => {
      resp.status(HttpStatus.BAD_REQUEST);
      resp.end();
    });

  });

module.exports = router;
