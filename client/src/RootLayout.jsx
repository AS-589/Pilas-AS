import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Widgets from './components/Widgets'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ThemeModal from './components/ThemeModal'

const RootLayout = () => {
    const {themeModalIsOpen} = useSelector(state => state?.ui)
    const {primaryColor, backgroundColor} = useSelector((state => state?.ui?.theme));

    useEffect(() => {
        const body = document.body;
        body.className = `${primaryColor} ${backgroundColor}`
    }, [primaryColor, backgroundColor])

  return (
    <div>
      <Navbar />
      <main className='main'>
        <div className='container main__container'>
            <Sidebar />
            <Outlet />
            <Widgets />
            {themeModalIsOpen && <ThemeModal />}
        </div>

      </main>
    </div>
  )
}

export default RootLayout
