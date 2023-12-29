const initialState = null;

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload || null; // 만약 action.payload가 falsy한 경우 null을 반환
    default:
      return state;
  }
};

export default userReducer;