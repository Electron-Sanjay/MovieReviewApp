import axios from'axios';

export default axios.create({
    baseURL:'https://094d-74-142-207-26.ngrok-free.app',
    headers:{"ngrok-skip-browser-warning":"true"}
});