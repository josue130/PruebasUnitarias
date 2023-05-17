const express = require("express");
const employeeSchema = require("../models/employeeModel");
const reservationSchema = require("../models/reservationModel");
var XMLHttpRequest = require("xhr2");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");

const router = express.Router();

const usersPerDay = function (callback) {
  dayjs.extend(isBetween);
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);

      var body = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      if (response.length > 0) {
        for (let i = 0; i < response.length; i++) {
          // empleados
          var obj = JSON.parse(response[i].shift); // horario del empleado
          for (let j = 0; j < obj.length; j++) {
            obj[j].periods.forEach((period, idx) => {
              let start = dayjs(period.start).hour();
              let end = dayjs(period.end).hour();
              console.log(
                `INICIO: ${dayjs(period.start).format("h:mm A")} - FIN: ${dayjs(
                  period.end
                ).format("h:mm A")}`
              );
              let lastIdx = -2;
              for (let h = start; h <= end; h++) {
                if (Math.ceil(h / 2) - 1 !== lastIdx) {
                  console.log(`DAY -> ${j}`);
                  lastIdx = Math.ceil(h / 2) - 1;
                  body[j][lastIdx]++;
                }
              }
              //console.log("\n\n");
            });
          }
        }
        // console.log(body);
        callback(body);
      } else {
        callback(body);
      }
    }
  };

  request.open("GET", `http://localhost:9000/api/employee/getAll`);
  request.send();
};

const usersPerDayDepartment = function (department, callback) {
  dayjs.extend(isBetween);
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);

      var body = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      if (response.length > 0) {
        for (let i = 0; i < response.length; i++) {
          // empleados
          if (response[i].department !== department) continue;
          var obj = JSON.parse(response[i].shift); // horario del empleado
          for (let j = 0; j < obj.length; j++) {
            obj[j].periods.forEach((period, idx) => {
              let start = dayjs(period.start).hour();
              let end = dayjs(period.end).hour();
              console.log(
                `INICIO: ${dayjs(period.start).format("h:mm A")} - FIN: ${dayjs(
                  period.end
                ).format("h:mm A")}`
              );
              let lastIdx = -2;
              for (let h = start; h <= end; h++) {
                if (Math.ceil(h / 2) - 1 !== lastIdx) {
                  console.log(`DAY -> ${j}`);
                  lastIdx = Math.ceil(h / 2) - 1;
                  body[j][lastIdx]++;
                }
              }
              //console.log("\n\n");
            });
          }
        }
        // console.log(body);
        callback(body);
      } else {
        callback(body);
      }
    }
  };

  request.open("GET", `http://localhost:9000/api/employee/getAll`);
  request.send();
};

const totalOccupied = async function () {
  const totalOverall = await reservationSchema.countDocuments();
  return totalOverall;
};

const totalOccupiedParkingLot = async function (parkingLot) {
  const result = await reservationSchema.countDocuments({
    parkingLotId: parkingLot,
  });
  return result;
};

const occupiedByDepartment = function (department, totalOverall, callback) {
  let total = 0;
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      let response = JSON.parse(this.responseText);
      var request2 = [],
        i;
      let counter = 0;
      if (response.length > 0) {
        for (i = 0; i < response.length; i++) {
          (function (i) {
            let userId = response[i].userId;
            request2[i] = new XMLHttpRequest();
            request2[i].open(
              "GET",
              `http://localhost:9000/api/employee/${userId}`
            );

            request2[i].onreadystatechange = function () {
              if (
                request2[i].readyState === XMLHttpRequest.DONE &&
                request2[i].status === 200
              ) {
                counter += 1;
                let response = JSON.parse(request2[i].responseText);
                if (response) {
                  if (response.department == department.department) {
                    total += 1;
                  }
                }
                if (counter == totalOverall) {
                  callback(total);
                }
              }
            };
            request2[i].send();
          })(i);
        }
      } else {
        callback(total);
      }
    }
  };

  request.open("GET", `http://localhost:9000/api/reservation/getAll`);
  request.send();
};

const occupiedByDepartmentParkingLot = function (
  department,
  totalOverall,
  parkingLot,
  callback
) {
  let total = 0;
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      let response = JSON.parse(this.responseText);
      var request2 = [],
        i;
      let counter = 0;
      if (response.length > 0) {
        for (i = 0; i < response.length; i++) {
          (function (i) {
            let userId = response[i].userId;
            request2[i] = new XMLHttpRequest();
            request2[i].open(
              "GET",
              `http://localhost:9000/api/employee/${userId}`
            );

            request2[i].onreadystatechange = function () {
              if (
                request2[i].readyState === XMLHttpRequest.DONE &&
                request2[i].status === 200
              ) {
                counter += 1;
                let response = JSON.parse(request2[i].responseText);
                if (response) {
                  if (response.department == department) {
                    total += 1;
                  }
                }
                if (counter == totalOverall) {
                  callback(total);
                }
              }
            };
            request2[i].send();
          })(i);
        }
      } else {
        callback(total);
      }
    }
  };

  request.open(
    "GET",
    `http://localhost:9000/api/reservation/getAll/${parkingLot}`
  );
  request.send();
};

// const occupiedBySpaceParkingLot = function (space, totalOverall, parkingLot, callback) {
//     let total = 0;
//     var request = new XMLHttpRequest();

//     request.onreadystatechange = function () {
//         if(request.readyState === XMLHttpRequest.DONE && request.status === 200) {
//             let response = JSON.parse(this.responseText);
//             var request2 = [], i;
//             let counter = 0;
//             for(i = 0; i < response.length; i++) {
//                 (function(i) {
//                     let parkingSpaceId = response[i].parkingSpaceId;
//                     request2[i] = new XMLHttpRequest();
//                     request2[i].open('GET', `http://localhost:9000/api/parkingSpecificSpace/${parkingSpaceId}`);

//                     request2[i].onreadystatechange = function () {
//                         if(request2[i].readyState === XMLHttpRequest.DONE && request2[i].status === 200) {
//                             counter += 1;
//                             let response = JSON.parse(request2[i].responseText);
//                             if (response) {
//                                 if(response.type == space) {
//                                     total += 1;
//                                 }
//                             }
//                             if (counter == totalOverall) {
//                                 callback(total);
//                             }
//                         }
//                     }
//                     request2[i].send();
//                 })(i);
//             }
//         }
//     }
//
//     request.open('GET', `http://localhost:9000/api/reservation/getAll/${parkingLot}`);
//     request.send();
// };

const occupiedBySpaceParkingLot = function (
  totalOverall,
  parkingLot,
  callback
) {
  let generalTotal, officialTotal, leadershipTotal, visitorTotal, specialTotal;
  generalTotal =
    officialTotal =
    leadershipTotal =
    visitorTotal =
    specialTotal =
      0;
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      let response = JSON.parse(this.responseText);
      var request2 = [],
        i;
      let counter = 0;
      if (response.length > 0) {
        for (i = 0; i < response.length; i++) {
          (function (i) {
            let parkingSpaceId = response[i].parkingSpaceId;
            request2[i] = new XMLHttpRequest();
            request2[i].open(
              "GET",
              `http://localhost:9000/api/parkingSpecificSpace/${parkingSpaceId}`
            );

            request2[i].onreadystatechange = function () {
              if (
                request2[i].readyState === XMLHttpRequest.DONE &&
                request2[i].status === 200
              ) {
                counter += 1;
                let response = JSON.parse(request2[i].responseText);
                if (response) {
                  if (response.type == "official") {
                    officialTotal += 1;
                  } else if (response.type == "leadership") {
                    leadershipTotal += 1;
                  } else if (response.type == "visitor") {
                    visitorTotal += 1;
                  } else if (response.type == "special") {
                    specialTotal += 1;
                  } else if (response.type == "general") {
                    generalTotal += 1;
                  }
                }
                if (counter == totalOverall) {
                  callback(
                    officialTotal,
                    generalTotal,
                    leadershipTotal,
                    visitorTotal,
                    specialTotal
                  );
                }
              }
            };
            request2[i].send();
          })(i);
        }
      } else {
        callback(
          officialTotal,
          generalTotal,
          leadershipTotal,
          visitorTotal,
          specialTotal
        );
      }
    }
  };

  request.open(
    "GET",
    `http://localhost:9000/api/reservation/getAll/${parkingLot}`
  );
  request.send();
};

const occupiedBySpaceDepartmentParkingLot = function (
  totalOverall,
  parkingLot,
  department,
  callback
) {
  let generalTotal, officialTotal, leadershipTotal, visitorTotal, specialTotal;
  generalTotal =
    officialTotal =
    leadershipTotal =
    visitorTotal =
    specialTotal =
      0;
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      let response = JSON.parse(this.responseText);
      var request2 = [],
        i;
      var request3 = [],
        i;
      let counter = 0;
      if (response.length > 0) {
        for (i = 0; i < response.length; i++) {
          (function (i) {
            let parkingSpaceId = response[i].parkingSpaceId;
            let userId = response[i].userId;
            request2[i] = new XMLHttpRequest();
            request3[i] = new XMLHttpRequest();
            request2[i].open(
              "GET",
              `http://localhost:9000/api/parkingSpecificSpace/${parkingSpaceId}`
            );
            request3[i].open(
              "GET",
              `http://localhost:9000/api/employee/${userId}`
            );

            request2[i].onreadystatechange = function () {
              if (
                request2[i].readyState === XMLHttpRequest.DONE &&
                request2[i].status === 200
              ) {
                let response = JSON.parse(request2[i].responseText);
                request3[i].onreadystatechange = function () {
                  if (
                    request3[i].readyState === XMLHttpRequest.DONE &&
                    request3[i].status === 200
                  ) {
                    counter += 1;
                    let response2 = JSON.parse(request3[i].responseText);

                    if (response && response2) {
                      if (
                        response.type == "official" &&
                        response2.department == department
                      ) {
                        officialTotal += 1;
                      } else if (
                        response.type == "leadership" &&
                        response2.department == department
                      ) {
                        leadershipTotal += 1;
                      } else if (
                        response.type == "visitor" &&
                        response2.department == department
                      ) {
                        visitorTotal += 1;
                      } else if (
                        response.type == "special" &&
                        response2.department == department
                      ) {
                        specialTotal += 1;
                      } else if (
                        response.type == "general" &&
                        response2.department == department
                      ) {
                        generalTotal += 1;
                      }
                    } else {
                      callback(
                        officialTotal,
                        generalTotal,
                        leadershipTotal,
                        visitorTotal,
                        specialTotal
                      );
                    }
                    if (counter == totalOverall) {
                      callback(
                        officialTotal,
                        generalTotal,
                        leadershipTotal,
                        visitorTotal,
                        specialTotal
                      );
                    }
                  }
                };
                request3[i].send();
              }
            };
            request2[i].send();
          })(i);
        }
      } else {
        callback(
          officialTotal,
          generalTotal,
          leadershipTotal,
          visitorTotal,
          specialTotal
        );
      }
    }
  };

  request.open(
    "GET",
    `http://localhost:9000/api/reservation/getAll/${parkingLot}`
  );
  request.send();
};

// ocupación por departamento de todos los estacionamientos
router.get("/statistics/totalOccupied/:department", (req, res) => {
  totalOccupied()
    .then((totalOverall) => {
      occupiedByDepartment(
        req.params,
        totalOverall,
        function (departmentTotal) {
          const body = {
            total: totalOverall,
            departmentTotal: departmentTotal,
          };
          res.json(body);
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
});

// ocupación por departamento de un estacionamiento especifico
router.get(
  "/statistics/occupiedByDepartment/:parkingLot/:department",
  (req, res) => {
    totalOccupiedParkingLot(req.params.parkingLot)
      .then((totalOverall) => {
        occupiedByDepartmentParkingLot(
          req.params.department,
          totalOverall,
          req.params.parkingLot,
          function (departmentTotal) {
            const body = {
              total: totalOverall,
              departmentTotal: departmentTotal,
            };
            res.json(body);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

// ocupación por tipo de espacio de un estacionamiento especifico
router.get("/statistics/occupiedBySpace/:parkingLot", (req, res) => {
  totalOccupiedParkingLot(req.params.parkingLot)
    .then((totalOverall) => {
      occupiedBySpaceParkingLot(
        totalOverall,
        req.params.parkingLot,
        function (official, general, leadership, visitor, special) {
          const body = {
            totalOverall: totalOverall,
            officialTotal: official,
            generalTotal: general,
            leadershipTotal: leadership,
            visitorTotal: visitor,
            specialTotal: special,
          };
          res.json(body);
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get(
  "/statistics/occupiedBySpace/:parkingLot/:department",
  (req, res) => {
    totalOccupiedParkingLot(req.params.parkingLot)
      .then((totalOverall) => {
        occupiedBySpaceParkingLot(
          totalOverall,
          req.params.parkingLot,
          function (official, general, leadership, visitor, special) {
            const body = {
              totalOverall: totalOverall,
              officialTotal: official,
              generalTotal: general,
              leadershipTotal: leadership,
              visitorTotal: visitor,
              specialTotal: special,
            };
            res.json(body);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

router.get(
  "/statistics/occupiedBySpaceDepartmentParkingLot/:parkingLot/:department",
  (req, res) => {
    totalOccupied()
      .then((totalOverall) => {
        occupiedBySpaceDepartmentParkingLot(
          totalOverall,
          req.params.parkingLot,
          req.params.department,
          function (official, general, leadership, visitor, special) {
            const body = {
              totalOverall: totalOverall,
              officialTotal: official,
              generalTotal: general,
              leadershipTotal: leadership,
              visitorTotal: visitor,
              specialTotal: special,
            };
            res.json(body);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

// router.get("/statistics/occupiedBySpace/:parkingLot/:space", (req, res) => {
//     totalOccupiedParkingLot(req.params.parkingLot)
//         .then(totalOverall => {
//             occupiedBySpaceParkingLot(req.params.space, totalOverall, req.params.parkingLot, function (departmentTotal) {
//                 const body = {
//                     total: totalOverall,
//                     departmentTotal: departmentTotal
//                 }
//                 res.json(body);
//             })
//         })
//         .catch((err) => {
//             console.log(err);
//         })
// });

router.get("/statistics/usersPerDay", (req, res) => {
  usersPerDay(function (result) {
    res.json(result);
  });
});

router.get("/statistics/usersPerDayDepartment/:department", (req, res) => {
  usersPerDayDepartment(req.params.department, function (result) {
    res.json(result);
  });
});

module.exports = router;
