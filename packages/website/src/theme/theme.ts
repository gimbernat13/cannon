import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
	  fonts: {
		heading: 'var(--font-miriam)',
		body: 'var(--font-inter)',
	  },
	  colors: {
		blue: {
		  950: '#00081a',
		  975: '#000714',
		},
		teal: {
		  50: '#d7fdff',
		  100: '#aaf2ff',
		  200: '#7ae9ff',
		  300: '#48dfff',
		  400: '#1ad6ff',
		  500: '#00bce6',
		  600: '#0092b4',
		  700: '#006882',
		  800: '#004050',
		  900: '#00171f',
		},
	  },
	  components: {
		Button: {
			baseStyle: {
				fontWeight: "bold", // Customize the font weight
				fontFamily: "var(--font-miriam)", // Customize the font family
				textTransform: 'uppercase',
			},
		},
	  },
	  styles: {
		global: {
		  "html, body": {
			color: "#ffffffd9", 
		  },
		},
	  },
  });