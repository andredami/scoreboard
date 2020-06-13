const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const xlsx = require('node-xlsx').default;
const stream = require('stream');

const router = express.Router();

const mainHandler = function(editable) {
  return function(req, res, next) {
    const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));
  
    new Promise((resolve, reject) => {
      db.all(
        `SELECT rowid, * 
        FROM competitions
        ORDER BY place`,
        [],
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            reject(err);
          }
        }
      );
    }).then((result) => {
      res.render('index', {
        editable: editable,
        rows: result,
      });
    }).then((result) => {
      if (editable) {
        global.triggerReload();
      }
    }).catch((err) => {
      res.render('error', {
        message: "Impossibile connettersi al database",
        error: err,
      });
    }).finally(() => {
      db.close();
    });
  };
};

/* GET home page. */
router.get('/', mainHandler(false));

/* GET admin page. */
router.get('/admin', mainHandler(true));

/* POST row activate. */
router.post('/row-activate', function(req, res, next) {
  const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));

  new Promise((resolve, reject) => {
    db.run(
      `UPDATE competitions 
      SET active = 1
      WHERE place = ?`,
      [req.body.place],
      (err, rows) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      }
    );
  }).then((result) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE competitions 
        SET active = 0
        WHERE place <> ?`,
        [req.body.place],
        (err, rows) => {
          if (!err) {
            resolve();
          } else {
            reject(err);
          }
        }
      );
    });
  }).then((result) => {
    res.redirect('../admin');
  }).catch((err) => {
    res.render('error', {
      message: "Impossibile connettersi al database",
      error: err,
    });
  }).finally(() => {
    db.close();
  });
});

/* POST row edit. */
router.post('/row-edit', function(req, res, next) {
  const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));

  new Promise((resolve, reject) => {
    db.run(
      `UPDATE competitions 
      SET competitor1 = ?,
          competitor2 = ?,
          competitor3 = ?,
          result1     = ?,
          result2     = ?,
          result3     = ?
      WHERE place = ?`,
      [
        req.body.competitor1,
        req.body.competitor2,
        req.body.competitor3,
        req.body.result1,
        req.body.result2,
        req.body.result3,
        req.body.place
      ],
      (err, rows) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      }
    );
  }).then((result) => {
      res.redirect('../admin');
  }).catch((err) => {
    res.render('error', {
      message: "Impossibile connettersi al database",
      error: err,
    });
  }).finally(() => {
    db.close();
  });
});

/* POST row add. */
router.post('/row-add', function(req, res, next) {
  const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));

  new Promise((resolve, reject) => {
    db.get(
      `SELECT place
      FROM competitions
      ORDER BY place DESC`,
      [],
      (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      }
    );
  }).then((result) => {
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO competitions (place, competitor1, competitor2, competitor3, result1, result2, result3)
          VALUES
            (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            result ? result.place + 1 : 0,
            req.body.competitor1,
            req.body.competitor2,
            req.body.competitor3,
            req.body.result1,
            req.body.result2,
            req.body.result3
          ],
          (err, rows) => {
            if (!err){
              resolve();
            } else {
              reject(err);
            }
          }
        );
      });
  }).then((result) => {
    res.redirect('../admin');
  }).catch((err) => {
    res.render('error', {
      message: "Impossibile connettersi al database",
      error: err,
    });
  }).finally(() => {
    db.close();
  });
});

/* POST row down. */
router.post('/row-down', function(req, res, next) {
  const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));

  new Promise((resolve, reject) => {
    db.get(
      `SELECT place
      FROM competitions
      ORDER BY place DESC`,
      [],
      (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      }
    );
  }).then((result) => {
    if (req.body.place >= result.place) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT rowid
          FROM competitions
          WHERE place = ?`,
          [req.body.place],
          (err, rows) => {
            if (!err) {
              resolve(rows);
            } else {
              reject(err);
            }
          }
        );
      }).then((result) => {
          return new Promise((resolve, reject) => {
            db.run(
              `UPDATE competitions
                SET place = ?
                WHERE place = ?
              `,
              [
                req.body.place,
                1 + Number(req.body.place),
              ],
              (err, rows) => {
                if (!err){
                  resolve(result);
                } else {
                  reject(err);
                }
              }
            );
          });
      }).then((result) => {
        return new Promise((resolve, reject) => {
          db.run(
            `UPDATE competitions
              SET place = ?
              WHERE rowid = ?
            `,
            [
              1 + Number(req.body.place),
              result.rowid,
            ],
            (err, rows) => {
              if (!err){
                resolve();
              } else {
                reject(err);
              }
            }
          );
        });
      });
    }
  }).then((result) => {
    res.redirect('../admin');
  }).catch((err) => {
    res.render('error', {
      message: "Impossibile connettersi al database",
      error: err,
    });
  }).finally(() => {
    db.close();
  });
});

/* POST row up. */
router.post('/row-up', function(req, res, next) {
  const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));

  new Promise((resolve, reject) => {
    db.get(
      `SELECT place
      FROM competitions
      ORDER BY place ASC`,
      [],
      (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      }
    );
  }).then((result) => {
    if (req.body.place <= result.place) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT rowid
          FROM competitions
          WHERE place = ?`,
          [req.body.place],
          (err, rows) => {
            if (!err) {
              resolve(rows);
            } else {
              reject(err);
            }
          }
        );
      }).then((result) => {
          return new Promise((resolve, reject) => {
            db.run(
              `UPDATE competitions
                SET place = ?
                WHERE place = ?
              `,
              [
                req.body.place,
                -1 + Number(req.body.place),
              ],
              (err, rows) => {
                if (!err){
                  resolve(result);
                } else {
                  reject(err);
                }
              }
            );
          });
      }).then((result) => {
        return new Promise((resolve, reject) => {
          db.run(
            `UPDATE competitions
              SET place = ?
              WHERE rowid = ?
            `,
            [
              -1 + Number(req.body.place),
              result.rowid,
            ],
            (err, rows) => {
              if (!err){
                resolve();
              } else {
                reject(err);
              }
            }
          );
        });
      });
    }
  }).then((result) => {
    res.redirect('../admin');
  }).catch((err) => {
    res.render('error', {
      message: "Impossibile connettersi al database",
      error: err,
    });
  }).finally(() => {
    db.close();
  });
});

router.get('/export', function(req, res, next) {
  const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));
  
  new Promise((resolve, reject) => {
    db.all(
      `SELECT rowid, * 
      FROM competitions
      ORDER BY place`,
      [],
      (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      }
    );
  }).then((result) => {
    const header = [[
      "Partecipante 1",
      "Partecipante 2",
      "Partecipante 3",
      "Risultato 1",
      "Risultato 2",
      "Risultato 3"
    ]];
    
    const data = result.map((r) => [r.competitor1, r.competitor2, r.competitor3, r.result1, r.result2, r.result3]);
    const buffer = xlsx.build([{name: "scoreboard", data: header.concat(data)}]);

    console.log(buffer);

    const readStream = new stream.PassThrough();
    readStream.end(buffer);
  
    res.set('Content-disposition', 'attachment; filename=scoreboard.xlsx');
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
    readStream.pipe(res);
  }).catch((err) => {
    res.render('error', {
      message: "Impossibile connettersi al database",
      error: err,
    });
  }).finally(() => {
    db.close();
  });
});

router.get('/clear', function(req, res, next) {
  const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));

  new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM competitions`,
      [],
      (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      }
    );
  }).then((result) => {
    return new Promise((resolve, reject) => {
      db.run(
        `VACUUM`,
        [],
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            reject(err);
          }
        }
      );
    });
  }).then((result) => {
    res.redirect('../admin');
  }).catch((err) => {
    res.render('error', {
      message: "Impossibile connettersi al database",
      error: err,
    });
  }).finally(() => {
    db.close();
  });  
});

router.post('/upload', function(req, res, next) {
  if(!req.files) {
    res.redirect('../admin');
  } else {
    const db = new sqlite3.Database(path.join(__dirname, '../', 'root.db'));

    new Promise((resolve, reject) => {
      const file = req.files.file;
  
      const workSheet = xlsx.parse(file.data);
      if (workSheet[0]) {
        db.run(
          `DELETE FROM competitions`,
          [],
          (err, rows) => {
            if (!err) {
              resolve(workSheet[0].data);
            } else {
              reject(err);
            }
          }
        );
      } else {
        reject({
          status: 'Il file non contiene fogli di calcolo.',
        });
      }  
    }).then((result) => {
      return new Promise((resolve, reject) => {
        const header = ['Partecipante 1', 'Partecipante 2', 'Partecipante 3', 'Risultato 1', 'Risultato 2', 'Risultato 3'];
        if (JSON.stringify(header) == JSON.stringify(result[0])) {
          result.shift();
        }
        for (i = 0; i<result.length; i++) {
          result[i].unshift(''+i+'');
          for (j = 0; j < 7; j++) {
            if (!result[i][j]) {
              result[i][j] = '';
            }
          }
        }
        const query = `
        INSERT INTO competitions 
          (place, competitor1, competitor2, competitor3, result1, result2, result3)
        VALUES 
          ${result.map((e) => '('+e.map((v) => `'${v}'`).join(',')+')').join(',')}
        `;
        console.log(query);
        db.run(
          query,
          [],
          (err, rows) => {
            if (!err) {
              resolve(rows);
            } else {
              reject(err);
            }
          }
        );
      });
    }).then((result) => {
      res.redirect('../admin');
    }).catch((err) => {
      res.render('error', {
        message: "Impossibile connettersi al database",
        error: err,
      });
    }).finally(() => {
      db.close();
    });
  }
});

module.exports = router;
