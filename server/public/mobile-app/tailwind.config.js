
// remember to use module.exports instead of tailwind.config in production
tailwind.config = 
   {
      // Note: config only includes the used styles & variables of your selection
      content: ["./src/**/*.{html,vue,svelte,js,ts,jsx,tsx}"],
      theme: {
        extend: {
          fontFamily: {
            'body-medium-regular-font-family': "EncodeSans-Regular, sans-serif",
'body-large-bold-font-family': "EncodeSans-Bold, sans-serif",
          },
          fontSize: {
            'body-medium-regular-font-size': "14px",
'body-large-bold-font-size': "16px",
          },
          fontWeight: {
            'body-medium-regular-font-weight': "400",
'body-large-bold-font-weight': "700",
          },
          lineHeight: {
            'body-medium-regular-line-height': "150%",
'body-large-bold-line-height': "150%", 
          },
          letterSpacing: {
             
          },
          borderRadius: {
              
          },
          colors: {
            'foundation-neutral-grey-13': '#292526',
'foundation-grey-grey-10': '#121111',
'foundation-grey-grey-4': '#787676',
'foundation-neutral-grey-2': '#fdfdfd',
'foundation-neutral-grey-5': '#dfdede',
'foundation-neutral-grey-6': '#cac9c9',
'neutral-100': '#101010',
            
          },
          spacing: {
              
          },
          width: {
             
          },
          minWidth: {
             
          },
          maxWidth: {
             
          },
          height: {
             
          },
          minHeight: {
             
          },
          maxHeight: {
             
          }
        }
      }
    }

          