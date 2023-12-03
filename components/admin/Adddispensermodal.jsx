
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';


function App() {
    const [ipAddress, setIpAddress] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [ipError, setIpError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [modal, setModal] = useState(false);
    const [ipandlocation, setipandlocation] = useState(false);
    const [checknullwc, setchecknull] = useState(false);
    const [location, setLocation] = useState('');
     const [notExist, setnotExist] = useState(false);
    const [noLocation, setnoLocation] = useState('');
    const handleIpAddressChange = async (e) => {
      const enteredIp = e.target.value;
      setIpAddress(enteredIp);
    
      const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    
      if (!ipRegex.test(enteredIp)) {
        setIpError('Enter a valid IP address');
      } else {
        setIpError(''); // Assuming this is the success message
    
        // Check for duplicate IP
        await checkForDuplicateIP(enteredIp);
        
        const enteredLocation = location.trim(); // Trim the entered location to remove leading and trailing whitespaces
          if (!enteredLocation) {
              setnoLocation('Enter a location');
          } else {
              setnoLocation('');
          }
        // Additional logic if needed based on the checkForDuplicateIP result
      }
    };
    
    const checkForDuplicateIP = async (ip) => {
      try {
        const response = await fetch('http://localhost:3001/checkDuplicate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ip_address: ip}),
        });
    
        if (response.ok) {
          const data = await response.json();
          if (data.duplicate) {
            setIpError('IP address already exists');
          } else {
            setIpError('');
          }
    
          const enteredLocation = location.trim(); // Trim the entered location to remove leading and trailing whitespaces
          if (!enteredLocation) {
              setnoLocation('');
          } else {
              setnoLocation('');
          }
          
        } else {
          console.error('Error checking IP existence:', response.statusText);
         
        }
      } catch (error) {
        console.error('Error checking IP existence:', error);
       
      }
    };
  

    const handleCheckWaterLevel = async () => {
      try {
        const response = await fetch('http://localhost:3001/checknull', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
      
        });
        const data = await response.json();
    
        if (response.ok) {
          setnotExist(true);
          // If water level is null, show the modal
          if (data.error) {
            setnotExist(false);
          } else {
            // Handle other cases if needed
          }
        } else {
          console.error('Error:', data.error);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    
    const handleSubmit = async () => {
      try {
          if (!location.trim()) {
              setnoLocation('Enter a location');
              return;
          }
  
          const response = await fetch('http://localhost:3001/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ip_address: ipAddress, location: location }),
          });
  
          if (ipAddress === '') {
              setnoLocation('Please answer the question');
          }
  
          if (response.ok) {
              console.log('User registered successfully!');
              setRegisteredUsers([...registeredUsers, { ip: ipAddress, location: location }]);
              checkForDuplicateIP();
              setIpAddress('');
              setLocation('');
              setModal(true);
              toggleModal();
              setRegistrationSuccess(true);
          } else {
              console.error('Error registering user.');
              setRegistrationSuccess(false);
          }
      } catch (error) {
          console.error('Error:', error);
          setRegistrationSuccess(false);
      }
  };
  

    



    const closeModal = () => {
      setnotExist(false);
    };



    const toggleModal = () => {
        setShowModal(!showModal);
        setRegistrationSuccess(false);
        setIpAddress('');
        setLocation('');
        setIpError('');

        
    };

    const customModalStyles = {
        content: {
            width: '27%',
            height: '50%',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'dirty white',
            border: '2px solid black',
            
        },
    };

    const ModalIPRegistered = {
        content: {
            width: '30%',
            height: '18%',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontWeight: 'Bold',
        },
    };

    const buttonAdd = (
      <button onClick={toggleModal} class ="btn btn-outline-light">
        {showModal ? 'Close' : 'Add Water Dispenser'}
      </button>
    );
    
  
    return (

        
        <div className="App">
            <div>{buttonAdd}</div>
            <Modal
                isOpen={showModal}
                onRequestClose={toggleModal}
                contentLabel="Registration"
                style={customModalStyles}
            >
                <div>
                    <h5>Add Water Dispenser</h5>
                </div>

                <div >
                <label>Location: </label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={{ display: 'flex', flexDirection: 'column' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>
                    {noLocation && <p style={{ color:'red', marginTop:'-60px' }}>{noLocation}</p>}
                        IP Address:
                        <input type="text" value={ipAddress} onChange={handleIpAddressChange} style={{ display: 'flex', flexDirection: 'column' }} />
                    </label>
                    {ipError && <p style={{ color: ipError === 'IP is Valid' ? 'blue' : 'red' }}>{ipError}</p>}

                </div>
                {registrationSuccess && (
    <div style={{ color: 'green', textAlign: 'center' }}>
        Registered successfully!
    </div>
)}
                <div style={{ alignSelf: 'flex-end' }}>
                <button className="btn btn-dark" onClick={async () => {await handleCheckWaterLevel(); await handleSubmit()}}
                 disabled={!location || !ipAddress || !!ipError || !!noLocation}>
                        Register
                    </button>
                </div>
                <button className="btn btn-danger" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={toggleModal}>
                    Close
                </button>
               
            </Modal>


{/*IP IS REGISTERED*/}
            <Modal
  isOpen={modal}
  onRequestClose={() => setModal(false)}
  contentLabel="IP Registered"
  style={ModalIPRegistered}
>
  <div style={{ textAlign: 'center' }}>
    <p>IP successfully registered!</p>
    <button className="btn btn-dark" onClick={() => setModal(false)}>Close</button>
  </div>
</Modal>
{/*}
<Modal isOpen={notExist} onRequestClose={closeModal}>
        <h2>Water Dispenser Not Found</h2>
        <p>The water dispenser with the specified IP address was not found or has a null water level.</p>
        <button onClick={closeModal}>Close Modal</button>
      </Modal> */}
{/*IP AND LOCATION NOT FOUND MODAL*/}
<Modal
  isOpen={ipandlocation}
  onRequestClose={() => setipandlocation(false)}
  contentLabel="IP and Location not Found"
  style={ModalIPRegistered}
>
  <div style={{ textAlign: 'center' }}>
    <p>NOT FOUND!</p>
    <button onClick={() => setipandlocation(false)}>Close</button>
  </div>
</Modal>
{/*MODAL for consumed and water-level*/}
<Modal
  isOpen={checknullwc}
  onRequestClose={() => setchecknull(false)}
  contentLabel="not Found"
  style={ModalIPRegistered}
>
  <div style={{ textAlign: 'center' }}>
    <p>NOT FOUND!</p>
    <button onClick={() => setchecknull(false)}>Close</button>
  </div>
</Modal>
        </div>
       
    );

    
}

export default App;