import React from 'react'
import {Button, Navbar, TextInput} from 'flowbite-react'
import {Link ,useLocation} from "react-router-dom"
import { AiOutlineSearch } from "react-icons/ai"
import { FaMoon } from "react-icons/fa"



export default function Header() {
  const path=useLocation.pathname;
  return (
    <Navbar className='border-b-2'>
      <Link to="/" className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white' >
        <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>Today's</span>
        Blog
      </Link>
      <form>
        <TextInput
          type='text'
          placeholder='Search ...'
          rightIcon={AiOutlineSearch}
          className='hidden lg:inline'
        />
      </form>   {/*used pill for rounded shape  */}
      <Button className='w-12 h-10 lg:hidden' color='grey'pill>
        <AiOutlineSearch/>
      </Button>
      {/* Used flex to make all one after another
          gap-2 is used to give gap between flexed elements
          md:order-2  means at medium size screen --> show it in 2md order
      */}
      <div className='flex gap-2 md:order-2'>  {/* hidden in smaller mobile size and larger screen more than mobile we want to show*/}
        <Button className='w-12 h-10 hidden sm:inline' color='greay' pill>
          <FaMoon/>
        </Button>
        <Link to='/sign-in'>
          <Button gradientDuoTone='purpleToBlue' outline>
            Sign In
          </Button>
        </Link>
        <Navbar.Toggle/>   {/*  For adding a toggle */}
      </div>
      <Navbar.Collapse >
        {/*It will active if path matches  -- we wil see color 
          as={'div'} we added this to remove error - Link and Link to both we are using so error was comming due to this in console
        */}
        <Navbar.Link  active={path==="/"} as={'div'}>
          <Link to="/" >
            Home
          </Link>
        </Navbar.Link>
        <Navbar.Link  active={path==="/about" } as={'div'}>
          <Link to="/about" >
            About
          </Link>
        </Navbar.Link>
        <Navbar.Link  active={path==="/projects"} as={'div'} >
          <Link to="/projects" >
            Projects
          </Link>
        </Navbar.Link>
        
      </Navbar.Collapse>
    </Navbar>
  )
}
