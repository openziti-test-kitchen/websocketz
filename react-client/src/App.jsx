import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

// Get WebSocket URL from frontend URL
const getWebSocketUrl = () => {
  if (process.env.FRONTEND_URL) {
    // Use environment variable if provided
    const url = new URL('/ws', process.env.FRONTEND_URL)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    return url.href
  }
  // Fall back to constructing from current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const [stopwatchTime, setStopwatchTime] = useState('00:00:00:00')
  const [heartbeats, setHeartbeats] = useState([])
  const [secondsSinceHeartbeat, setSecondsSinceHeartbeat] = useState(null)
  const [interruptions, setInterruptions] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  
  const ws = useRef(null)
  const startTime = useRef(null)
  const interruptionCount = useRef(0)
  const lastHeartbeat = useRef(null)
  const heartbeatScrollRef = useRef(null)
  const stopwatchInterval = useRef(null)
  const heartbeatInterval = useRef(null)
  
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  const formatTimestamp = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }
  
  const updateStopwatch = useCallback(() => {
    if (startTime.current === null) return
    const elapsed = Date.now() - startTime.current
    setStopwatchTime(formatDuration(elapsed))
  }, [])
  
  const updateHeartbeatStatus = useCallback(() => {
    if (lastHeartbeat.current === null) {
      setSecondsSinceHeartbeat(null)
      return
    }
    const seconds = Math.floor((Date.now() - lastHeartbeat.current) / 1000)
    setSecondsSinceHeartbeat(seconds)
  }, [])
  
  const logInterruption = useCallback(() => {
    if (startTime.current === null || !isConnected) return
    const elapsed = Date.now() - startTime.current
    interruptionCount.current++
    
    setInterruptions(prev => [{
      count: interruptionCount.current,
      duration: formatDuration(elapsed),
      timestamp: formatTimestamp(new Date())
    }, ...prev])
  }, [isConnected])
  
  const connect = useCallback(() => {
    const wsUrl = getWebSocketUrl()
    console.log('Connecting to WebSocket:', wsUrl)
    ws.current = new WebSocket(wsUrl)
    
    ws.current.onopen = () => {
      setConnectionStatus('Connected')
      setIsConnected(true)
      startTime.current = Date.now()
      
      stopwatchInterval.current = setInterval(updateStopwatch, 1000)
      heartbeatInterval.current = setInterval(updateHeartbeatStatus, 1000)
    }
    
    ws.current.onmessage = (event) => {
      lastHeartbeat.current = Date.now()
      const [emoji] = event.data.split(' ')
      setHeartbeats(prev => [...prev, emoji])
      updateHeartbeatStatus()
      
      // Scroll to the end of the heartbeat container
      if (heartbeatScrollRef.current) {
        heartbeatScrollRef.current.scrollLeft = heartbeatScrollRef.current.scrollWidth
      }
    }
    
    ws.current.onclose = () => {
      setConnectionStatus('Disconnected - Reconnecting...')
      setIsConnected(false)
      logInterruption()
      
      clearInterval(stopwatchInterval.current)
      clearInterval(heartbeatInterval.current)
      startTime.current = null
      lastHeartbeat.current = null
      setStopwatchTime('00:00:00:00')
      setHeartbeats([])
      
      setTimeout(connect, 1000)
    }
    
    ws.current.onerror = () => {
      setConnectionStatus('Connection Error')
      setIsConnected(false)
    }
  }, [updateStopwatch, updateHeartbeatStatus, logInterruption])
  
  useEffect(() => {
    connect()
    return () => {
      if (ws.current) {
        ws.current.close()
      }
      clearInterval(stopwatchInterval.current)
      clearInterval(heartbeatInterval.current)
    }
  }, [connect])
  
  return (
    <div className="container">
      <h1>WebSocket Stopwatch</h1>
      
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {connectionStatus}
      </div>
      
      <div className="heartbeat-container">
        <div className="heartbeat-status">
          Seconds since last server heartbeat: {secondsSinceHeartbeat === null ? 'waiting...' : secondsSinceHeartbeat}
        </div>
        <div className="heartbeat-scroll" ref={heartbeatScrollRef}>
          <div className="heartbeat-emojis">
            {heartbeats.map((emoji, index) => (
              <span key={index}>{emoji}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="stopwatch">
        {stopwatchTime}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Timer Duration</th>
            <th>Time of Interruption</th>
          </tr>
        </thead>
        <tbody>
          {interruptions.map((interruption, index) => (
            <tr key={index}>
              <td>{interruption.count}</td>
              <td>{interruption.duration}</td>
              <td>{interruption.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
