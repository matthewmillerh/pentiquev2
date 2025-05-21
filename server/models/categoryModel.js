//import db connection
import db from '../config/database.js'

// Get all categories
export const getAllCategories = result => {
    db.query(
        'SELECT `category1`.`category1Name`, `category2`.`category2Name`, `category3`.`category3Name`, `category1`.`category1ID` FROM `product` LEFT JOIN `category1` ON `category1`.`category1ID` = `product`.`category1ID` LEFT JOIN `category2` ON `category2`.`category2ID` = `product`.`category2ID` LEFT JOIN `category3` ON `category3`.`category3ID` = `product`.`category3ID` GROUP BY `category1`.`category1ID`, `category2`.`category2ID`, `category3`.`category3ID`',
        (err, results) => {
            if (err) {
                console.log(err)
                result(err, null)
            } else {
                result(null, results)
            }
        },
    )
}

//get all top level categories
export const getCategory1 = result => {
    db.query(
        'SELECT `product`.`productFileName`, `category1`.`category1Name`, `category2`.`category2Name`, `category3`.`category3Name`, `category1`.`category1ID` FROM `product` LEFT OUTER JOIN `category1` ON `category1`.`category1ID` = `product`.`category1ID` LEFT OUTER JOIN `category2` ON `category2`.`category2ID` = `product`.`category2ID` LEFT OUTER JOIN `category3` ON `category3`.`category3ID` = `product`.`category3ID` WHERE `product`.`productFeatured`=1',
        (err, results) => {
            if (err) {
                console.log(err)
                result(err, null)
            } else {
                result(null, results)
            }
        },
    )
}

//get all level 2 categories
export const getCategory2 = result => {
    db.query('SELECT * FROM category2', (err, results) => {
        if (err) {
            console.log(err)
            result(err, null)
        } else {
            result(null, results)
        }
    })
}

//get all level 2 categories
export const getCategory3 = result => {
    db.query('SELECT * FROM category3', (err, results) => {
        if (err) {
            console.log(err)
            result(err, null)
        } else {
            result(null, results)
        }
    })
}

//"SELECT `product`.`productFileName`, `category1`.`category1Name`, `category2`.`category2Name`, `category3`.`category3Name` FROM `product` LEFT OUTER JOIN `category1` ON `category1`.`category1ID` = `product`.`category1ID` LEFT OUTER JOIN `category2` ON `category2`.`category2ID` = `product`.`category2ID` LEFT OUTER JOIN `category3` ON `category3`.`category3ID` = `product`.`category3ID` WHERE `product`.`productFeatured`=1"

//get all level 2 and 3 categories for specified level 1 category
// export const getSubCategories = (id, result) => {
//   db.query("SELECT * FROM category2 LEFT JOIN category3 ON category2.category2ID = category3.category2ID WHERE category2.category1ID = ?", [id], (err, results) => {
//     if (err) {
//       console.log(err)
//       result(err, null)
//     } else {
//       console.log(id)
//       result(null, results)
//     }
//   })
// }

export const getSubCategories = (id, result) => {
    db.query(
        'SELECT *, (SELECT GROUP_CONCAT(category3Name) FROM category3 WHERE category2ID = category2.category2ID) AS category3Names FROM category2 WHERE category1ID = ?',
        [id],
        (err, results) => {
            if (err) {
                console.log(err)
                result(err, null)
            } else {
                console.log(id)
                result(null, results)
            }
        },
    )
}
