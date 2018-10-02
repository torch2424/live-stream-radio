// Singleton service to store the past 100 activites
const history = [];

module.exports = {
  getHistory: () => {
    return history;
  },
  addItemToHistory: item => {
    const historyItem = {
      ...item
    };

    historyItem.date = Date.now();

    history.push(historyItem);

    if (history.length > 100) {
      history.splice(history.length - 100, 100);
    }
  }
};
