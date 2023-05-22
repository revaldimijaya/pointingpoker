import { useEffect } from "react";

function Homepage() {
  useEffect(() => {
    const peerConnection = new RTCPeerConnection(null)
    peerConnection.onicecandidate = (e) => {
      if (e.candidate) console.log(JSON.stringify(e.candidate))
    }
  }, [])

  return (
    <div>
      Hello guys
    </div>
  );
}

export default Homepage;
