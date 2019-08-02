const budgetController = (function () {
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        totalIncome > 0 ? this.percentage = Math.round((this.value / totalIncome) * 100): this.percentage = -1;
    };

    Expense.prototype.getPercentages = function () {
        return this.percentage;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    const data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,

    };

    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            data.allItems[type].length > 0 ? ID = data.allItems[type][data.allItems[type].length - 1].id + 1 : ID = 0;

            type === 'exp' ? newItem = new Expense(ID, des, val) : newItem = new Income(ID, des, val);
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            const ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            const index = ids.indexOf(id);
            if (index !== -1) data.allItems[type].splice(index, 1);
        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            data.totals.inc > 0 ?
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) : data.percentage = -1;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
                console.log(data.totals.inc, current);
            })
        },

        getPercentages: function () {
            return data.allItems.exp.map(function (current) {
                return current.getPercentages();
            });
        },
    }
})();

const UIController = (function () {

    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };


    const formatNumber = function (num, type) {
        const numSplit = Math.abs(num).toFixed(2).split('.');

        let int = numSplit[0];
        let dec = numSplit[1];
        if (int.length > 3) int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`;

        return `${type === 'exp'? '-' : '+'} ${int}.${dec}`
    };

    const nodeListForEach = function(list, callback) {
        for (let i=0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
        },

        addListItem: function (obj, type) {
            let html, element;

            html = `<div class="item clearfix" id="${type === 'inc'? 'inc' : 'exp'}-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${formatNumber(obj.value, type)}</div>
                            ${type === 'exp'? '<div class="item__percentage"></div>' : ''}
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>`;

            type === 'inc'? element = DOMStrings.incomeContainer : element = DOMStrings.expensesContainer;
            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },

        deleteListItem: function (selectorID) {
            const element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            let fields;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            [...fields].forEach(function (current) {
                current.value = '';
            });

            [...fields][0].focus();
        },

        displayBudget: function (obj) {
            let type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            const percentageContainer = document.querySelector(DOMStrings.percentageLabel);

            percentageContainer.textContent = obj.percentage > 0 ? `${obj.percentage} %` : `---`;
        },

        displayPercentages: function (percentages) {
            const fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                current.textContent = percentages[index] > 0 ? `${percentages[index]} %` : `---`;
            });
        },

        getDate: function () {
            const now = new Date();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.dateLabel).textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;
        },

        changeType() {
            const fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMStrings;
        },
    }
})();

const controller = (function (budgetCtrl, UICtrl) {

    const setupEventListeners = function () {
        const DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.key === "Enter") ctrlAddItem();
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    };

    const updateBudget = function () {
        budgetCtrl.calculateBudget();
        const budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };

    const updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        const percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    };

    const ctrlAddItem = function() {
        let newItem;
        const input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetController.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearFields();

            updateBudget();
            updatePercentages();
        }
    };

    const ctrlDeleteItem = function (event) {

        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();

        }
    };


    return {
        init: function () {
            UICtrl.getDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();
