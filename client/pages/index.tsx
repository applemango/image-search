import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from './index.module.scss'
import { useRef, useState } from 'react'
import axios from 'axios'
import { post } from '@/lib/fetch'
import { motion } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const ref = useRef<any>(null)
  const [data, setData] = useState<Array<string>>([]) // base64 encoded image
  const [displayType, setType] = useState<boolean>(false)
  return <motion.div onClick={()=> setType((t)=> !t)} style={{
    display: "flex",
    width: "fit-content",
  }} animate={{
    x: `${data.length ? -100 : 0}vw`
  }}>
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div>
        <div className={styles.back} onClick={()=> ref?.current?.click()} style={{
          width: 200,
          height: 200,
          border: "1px solid #222",
          borderRadius: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: "pointer",
        }}>
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "100%",
            backgroundColor: "#222",
            position: "absolute",
            scale: 0
          }}/>
          <svg style={{zIndex: 2}} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-right" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#222" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M5 12l14 0" />
            <path d="M15 16l4 -4" />
            <path d="M15 8l4 4" />
          </svg>
        </div>
      </div>
      <input onChange={async (e: any)=> {
        const file = e.target.files[0]
        if(!file)
          return
        const [res, status] = await post("/search/image", {
          header: {},
          body: file,
          is_json: false
        })
        if(!status)
          return
        setData(res.data)
        console.log(res)
      }} ref={ref} style={{display: "none"}} type="file" />
    </div>
    <div style={{width: " 100vw", overflowX: "auto"}}>
      <div style={Object.assign({height: "80vh", minWidth: "80vw", padding: "10vh", display: "flex", alignItems: "center"}, displayType ? {} : {
        paddingRight: "0"
      } as React.CSSProperties)}>
        <div>
          <div className={styles.back} onClick={()=> setData([])} style={{
            width: 200,
            height: 200,
            border: "1px solid #222",
            borderRadius: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10vh",
            position: "relative",
            cursor: "pointer",
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: "100%",
              backgroundColor: "#222",
              position: "absolute",
              scale: 0
            }}/>
            <svg style={{zIndex: 2}} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-left" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#222" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M5 12l14 0" />
              <path d="M5 12l4 4" />
              <path d="M5 12l4 -4" />
            </svg>
          </div>
        </div>
        <div style={Object.assign({display: "flex"}, displayType ? {} : {
          flexWrap: "wrap",
          width: "calc(100vw - 20vh - 200px)",
          height: "80vh",
          justifyContent: "center",
          alignItems: "center",
        } as React.CSSProperties)}>
          { data.map((d, i)=> <div>
            <img style={{height: displayType ? "80vh" : 120 , marginRight: displayType ? "10vh" : 10}} key={i} src={`data:image/jpeg;base64,${d}`} />
          </div>) }
        </div>
      </div>
    </div>
  </motion.div>
}
