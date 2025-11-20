import TResponseType from "./response-type";
import TErrorType from "./error-type";

type TRequest = {
  type: TResponseType
  requestId: string
  error?: TErrorType
  payload?: any
}

export default TRequest