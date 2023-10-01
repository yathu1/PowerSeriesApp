import { useState } from "react";
import axios from "axios";

const PowerSeriesForm = () => {
  const [number, setNumber] = useState("");
  const [powerSeries, setPowerSeries] = useState([]);

  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Make the POST request to store the input
      const inputResponse = await axios.post("http://localhost:8800/api/storeInput", {
        number: parseInt(number),
      });

      console.log(inputResponse.data);

      // Get the inputId from the response
      const inputId = inputResponse.data;

      // Make the GET request to calculate the power series
      const powerSeriesResponse = await axios.get(`http://localhost:8800/api/calculatePowerSeries/${inputId}`);

      // Set the power series in state
      setPowerSeries(powerSeriesResponse.data);
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div>
      <h1>Power Series Calculator</h1>
      <form style={{display:'flex',flexDirection:'column'}} onSubmit={handleSubmit}>
        <label >
          Enter a number (1-10):
          <input style={{margin:'10px'}}
            type="number"
            min="1"
            max="10"
            value={number}
            onChange={handleNumberChange}
          />
        </label>
        <button  type="submit">Calculate</button>
      </form>
  
      <div>
        <h2>Power Series:</h2>
        <ul>
          {powerSeries.map((result, index) => (
            <li style={{listStyleType:'none'}} key={index}>{powerSeries[0]} ^ {index+1} = {result}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PowerSeriesForm;
