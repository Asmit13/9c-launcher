import { useEffect, useState } from 'react';

function RandomNumberGenerator() {
  const [randomNumber, setRandomNumber] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      generateRandomNumber();
    }, 1000); // Update every 1 second

    return () => clearInterval(intervalId);
  }, []);

  const generateRandomNumber = () => {
    const min = 1;
    const max = 100;
    const randomInt = Math.floor(Math.random() * (max - min + 1) + min);
    setRandomNumber(randomInt);
  };

  return (
    <div>
      <h2>Random Number Generator</h2>
      <p>Random Number: {randomNumber}</p>
    </div>
  );
}

export default RandomNumberGenerator;
