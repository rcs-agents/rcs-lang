export interface Example {
	name: string;
	description: string;
	code: string;
	category: 'basic' | 'flows' | 'messages' | 'full' | 'text' | 'rich-card' | 'carousel' | 'media' | 'otp' | 'webview';
}

export const examples: Example[] = [
	{
		name: 'Hello World',
		description: 'Minimal RCL agent with a simple greeting',
		category: 'basic',
		code: `agent HelloAgent
  displayName: "Hello"

  flow MainFlow
    start: Greeting
    
    on Greeting
      -> Welcome Message
  end

  messages Messages
    text Welcome Message "Hello! Welcome to RCL."
  end
end`,
	},
	{
		name: 'Simple Menu',
		description: 'Basic flow with user choices',
		category: 'flows',
		code: `agent MenuAgent
  displayName: "Simple Menu"
  start: MainFlow

  flow MainFlow
    start: Welcome

    on Welcome
      match @reply.text
        "Option 1" -> Response1
        "Option 2" -> Response2
        :default -> Welcome

    on Response1
      -> Welcome

    on Response2
      -> Welcome

  messages Messages
    text Welcome "Choose an option:"
      suggestions
        reply "Option 1"
        reply "Option 2"

    text Response1 "You selected Option 1"
      suggestions
        reply "Back"

    text Response2 "You selected Option 2"
      suggestions
        reply "Back"
end`,
	},
	{
		name: 'Context Variables',
		description: 'Using context to store and display user data',
		category: 'flows',
		code: `agent ContextDemo
  displayName: "Context Demo"
  start: MainFlow

  flow MainFlow
    start: AskName

    on AskName
      match @reply.text
        :default -> set @userName to @reply.text -> Greeting

    on Greeting
      match @reply.text
        "Continue" -> AskFavorite
        "Restart" -> AskName

    on AskFavorite
      match @reply.text
        :default -> set @favorite to @reply.text -> ShowInfo

    on ShowInfo
      match @reply.text
        "Start Over" -> AskName

  messages Messages
    text AskName "What's your name?"

    text Greeting "Hello, #{@userName}! Nice to meet you."
      suggestions
        reply "Continue"
        reply "Restart"

    text AskFavorite "What's your favorite color?"

    text ShowInfo "Got it! #{@userName} likes #{@favorite}."
      suggestions
        reply "Start Over"
end`,
	},
	{
		name: 'Sub-flow Example',
		description: 'Demonstrates flow composition with sub-flows',
		category: 'flows',
		code: `agent SubFlowDemo
  displayName: "Sub-flow Demo"
  start: MainFlow

  flow CollectInfo
    start: AskName

    on AskName
      match @reply.text
        :default -> set @name to @reply.text -> AskAge

    on AskAge
      match @reply.text
        :default -> set @age to @reply.text -> :end

  flow MainFlow
    start: Welcome

    on Welcome
      match @reply.text
        "Start" -> start CollectInfo
          on :end -> ShowResult
          on :cancel -> Welcome

    on ShowResult
      match @reply.text
        "Again" -> Welcome

  messages Messages
    text Welcome "Ready to collect your info?"
      suggestions
        reply "Start"

    text AskName "What's your name?"

    text AskAge "How old are you?"

    text ShowResult "Name: #{result.name}, Age: #{result.age}"
      suggestions
        reply "Again"
end`,
	},
	{
		name: 'Rich Card Messages',
		description: 'Using rich cards with media',
		category: 'messages',
		code: `agent RichCardDemo
  displayName: "Rich Cards"
  start: MainFlow

  flow MainFlow
    start: ShowCard

    on ShowCard
      match @reply.text
        "View Details" -> Details
        "Back" -> ShowCard

    on Details
      match @reply.text
        "Back" -> ShowCard

  messages Messages
    richCard ShowCard "Featured Product" :large
      description: "Check out our latest offering!"
      media: <url https://example.com/product.jpg>
      suggestions
        reply "View Details"

    text Details "Product details go here..."
      suggestions
        reply "Back"
end`,
	},
	{
		name: 'Carousel Messages',
		description: 'Display multiple cards in a carousel',
		category: 'messages',
		code: `agent CarouselDemo
  displayName: "Carousel"
  start: MainFlow

  flow MainFlow
    start: ShowProducts

    on ShowProducts
      match @reply.text
        :default -> ShowProducts

  messages Messages
    carousel ShowProducts "Our Products" :medium
      richCard Product1 "Product 1" :compact
        description: "First product description"
        media: <url https://example.com/p1.jpg>
      richCard Product2 "Product 2" :compact
        description: "Second product description"
        media: <url https://example.com/p2.jpg>
      richCard Product3 "Product 3" :compact
        description: "Third product description"
        media: <url https://example.com/p3.jpg>
      suggestions
        reply "Learn More"
        reply "Start Over"
end`,
	},
	{
		name: 'Coffee Shop (Minimal)',
		description: 'Simplified coffee ordering agent',
		category: 'full',
		code: `agent CoffeeShop
  displayName: "Quick Coffee"
  start: TopFlow

  config
    description: "Order your favorite coffee for pickup"
    logoUri: <url https://quickcoffee.com/logo.png>
    color: "#6F4E37"

  flow TopFlow
    start: Welcome

    on Welcome
      match @reply.text
        "Start Order" -> Welcome
        :default -> Welcome

  messages Messages
    text Welcome "Welcome to Quick Coffee!"
      suggestions
        reply "Start Order"
end`,
	},
	{
		name: 'Coffee Shop (Full)',
		description: 'Complete coffee ordering flow with nested sub-flows',
		category: 'full',
		code: `agent CoffeeShop
  displayName: "Quick Coffee"
  start: TopFlow

  config
    description: "Order your favorite coffee for pickup"
    logoUri: <url https://quickcoffee.com/logo.png>
    color: "#6F4E37"

  flow OrderCoffee
    start: ChooseDrink

    on ChooseDrink
      match @reply.text
        "Espresso" -> set @drink to "espresso" -> Customize
        "Latte" -> set @drink to "latte" -> Customize
        :default -> InvalidDrink

    on InvalidDrink
      -> ChooseDrink

    on Customize
      match @reply.text
        "Regular" -> set @milk to "regular" -> ChooseSize
        "Soy" -> set @milk to "soy" -> ChooseSize
        :default -> InvalidMilk

    on InvalidMilk
      -> Customize

    on ChooseSize
      match @reply.text
        "Small" -> set @size to "small" -> set @price to 3.50 -> :end
        "Large" -> set @size to "large" -> set @price to 5.50 -> :end
        :default -> InvalidSize

    on InvalidSize
      -> ChooseSize

  flow TopFlow
    start: Welcome

    on Welcome
      match @reply.text
        "Start Order" -> start OrderCoffee
          on :end -> OrderComplete
          on :cancel -> Welcome
        :default -> Welcome

    on OrderComplete
      match @reply.text
        "New Order" -> Welcome

  messages Messages
    text Welcome "Welcome to Quick Coffee!"
      suggestions
        reply "Start Order"

    text ChooseDrink "What would you like?"
      suggestions
        reply "Espresso"
        reply "Latte"

    text InvalidDrink "Please choose a valid drink."
      suggestions
        reply "Espresso"
        reply "Latte"

    text Customize "How would you like your milk?"
      suggestions
        reply "Regular"
        reply "Soy"

    text InvalidMilk "Please choose a valid milk."
      suggestions
        reply "Regular"
        reply "Soy"

    text ChooseSize "What size?"
      suggestions
        reply "Small $3.50"
        reply "Large $5.50"

    text InvalidSize "Please choose a valid size."
      suggestions
        reply "Small $3.50"
        reply "Large $5.50"

    text OrderComplete "Order complete! #{@size} #{@drink} with #{@milk} - $#{@price}"
      suggestions
        reply "New Order"
end`,
	},
];

// RCS Maker examples - realistic message samples for testing
export const makerExamples: Example[] = [
	{
		name: 'Text Message with Suggestions',
		description: 'Text message with reply, location, call, URL, and calendar suggestions',
		category: 'text',
		code: `agent TextMessageDemo
  displayName: "Nike Store"
  start: MainFlow

  config
    description: "Promotional text message with various suggestion types"
    logoUri: <url https://logo.clearbit.com/nike.com>
    color: "#111111"

  flow MainFlow
    start: Promotion

    on Promotion
      match @reply.text
        "Shop Now" -> :end
        :default -> Promotion

  messages Messages
    text Promotion "Hey there! 👋 Those fresh Nike kicks you were eyeing are practically flying off the shelves! Imagine the spring in your step and the envious glances you'll get rocking the latest innovation in comfort and style. Don't miss out on experiencing the ultimate fusion of performance and street cred. Tap here to grab your pair before they're gone! 🔥👟"
      suggestions
        reply "🛒 Shop Now"
        action <location "Nike near me"> "View Location"
          postback: "view_location"
          fallback: <url https://google.com>
        action <dial "+1234567890"> "Call Now"
          postback: "call_now"
          fallback: <url https://example.com/call_now>
        action <open https://example.com/new_arrivals> "New Arrivals"
          postback: "new_arrivals"
          description: "View new arrivals"
        action <calendar "Event Title"> "Add to calendar"
          postback: "add_to_calendar"
          description: "Event Description"
          start: <date "2025-04-13T13:00:00Z">
          end: <date "2025-04-13T14:00:00Z">
          fallback: <url https://example.com/add_to_calendar>
end`,
	},
	{
		name: 'Standalone Rich Card',
		description: 'Rich card with media, title, description, and action suggestions',
		category: 'rich-card',
		code: `agent RichCardDemo
  displayName: "Nike Store"
  start: MainFlow

  config
    description: "Standalone rich card with media and suggestions"
    logoUri: <url https://logo.clearbit.com/nike.com>
    color: "#111111"

  flow MainFlow
    start: ProductCard

    on ProductCard
      match @reply.text
        "Shop Now" -> :end
        :default -> ProductCard

  messages Messages
    richCard ProductCard "Nike Vomero 18" :tall
      description: "Maximum cushioning in the Vomero provides a comfortable ride for everyday runs. Our softest, most cushioned ride."
      media: <url https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/4d677534-954f-483e-a765-5bcb76775cb2/NIKE+VOMERO+18+%28GS%29.png>
      orientation: :vertical
      thumbnailAlignment: :left
      suggestions
        reply "🛒 Shop Now!"
        action <location "Nike near me"> "View Location"
          postback: "view_location"
          fallback: <url https://google.com>
        action <dial "+1234567890"> "Call Now"
          postback: "call_now"
          fallback: <url https://example.com/call_now>
        action <open https://example.com/new_arrivals> "New Arrivals"
          postback: "new_arrivals"
          description: "View new arrivals"
        action <calendar "Event Title"> "Add to calendar"
          postback: "add_to_calendar"
          description: "Event Description"
          start: <date "2025-04-13T13:00:00Z">
          end: <date "2025-04-13T14:00:00Z">
          fallback: <url https://example.com/add_to_calendar>
end`,
	},
	{
		name: 'Carousel',
		description: 'Carousel with multiple rich cards',
		category: 'carousel',
		code: `agent CarouselDemo
  displayName: "Nike Store"
  start: MainFlow

  config
    description: "Carousel with multiple product cards"
    logoUri: <url https://logo.clearbit.com/nike.com>
    color: "#111111"

  flow MainFlow
    start: ProductCarousel

    on ProductCarousel
      match @reply.text
        "Shop Now" -> :end
        :default -> ProductCarousel

  messages Messages
    carousel ProductCarousel "Featured Products" :medium
      richCard AlphaFly1 "Air Zoom AlphaFly 3 Flyknit sneakers" :medium
        description: "Made from breathable Flyknit, they're fitted with an extra set of 'Air Zoom' units"
        media: <url https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/da305c39-bc62-426e-8529-2566232c2145/W+AIR+ZOOM+ALPHAFLY+NEXT%25+3.png>
        suggestions
          action <dial "+1234567890"> "Call Now"
            postback: "call_now"
            fallback: <url https://example.com/call_now>
          action <calendar "Event Title"> "Add to calendar"
            postback: "add_to_calendar"
            description: "Event Description"
            start: <date "2025-04-13T13:00:00Z">
            end: <date "2025-04-13T14:00:00Z">
            fallback: <url https://example.com/add_to_calendar>

      richCard AlphaFly2 "Air Zoom AlphaFly 3 Flyknit sneakers" :medium
        description: "Fine-tuned for marathon speed, the Alphafly 3 helps push you beyond what you thought possible"
        media: <url https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/ad573250-ae8d-4194-b957-3865e590c00b/W+AIR+ZOOM+ALPHAFLY+NEXT%25+3.png>
        suggestions
          action <dial "+1234567890"> "Call Now"
            postback: "call_now"
            fallback: <url https://example.com/call_now>
          action <calendar "Event Title"> "Add to calendar"
            postback: "add_to_calendar"
            description: "Event Description"
            start: <date "2025-04-13T13:00:00Z">
            end: <date "2025-04-13T14:00:00Z">
            fallback: <url https://example.com/add_to_calendar>

      suggestions
        reply "🛒 Shop Now!"
        action <location "Nike near me"> "View Location"
          postback: "view_location"
          fallback: <url https://google.com>
        action <dial "+1234567890"> "Call Now"
          postback: "call_now"
          fallback: <url https://example.com/call_now>
        action <open https://example.com/new_arrivals> "New Arrivals"
          postback: "new_arrivals"
          description: "View new arrivals"
        action <calendar "Event Title"> "Add to calendar"
          postback: "add_to_calendar"
          description: "Event Description"
          start: <date "2025-04-13T13:00:00Z">
          end: <date "2025-04-13T14:00:00Z">
          fallback: <url https://example.com/add_to_calendar>
end`,
	},
	{
		name: 'GIF Message',
		description: 'Simple GIF media message',
		category: 'media',
		code: `agent MediaGifDemo
  displayName: "Media Demo"
  start: MainFlow

  config
    description: "Simple GIF media message"
    color: "#6366F1"

  flow MainFlow
    start: ShowGif

    on ShowGif
      match @reply.text
        :default -> ShowGif

  messages Messages
    media ShowGif <url https://rcsmaker.com/assets/sample_gif.gif>
end`,
	},
	{
		name: 'Image Message (JPG)',
		description: 'Simple JPG image message',
		category: 'media',
		code: `agent MediaJpgDemo
  displayName: "Media Demo"
  start: MainFlow

  config
    description: "Simple JPG image message"
    color: "#6366F1"

  flow MainFlow
    start: ShowImage

    on ShowImage
      match @reply.text
        :default -> ShowImage

  messages Messages
    media ShowImage <url https://rcsmaker.com/assets/sample_image.jpg>
end`,
	},
	{
		name: 'PDF Message',
		description: 'Simple PDF document message',
		category: 'media',
		code: `agent MediaPdfDemo
  displayName: "Media Demo"
  start: MainFlow

  config
    description: "Simple PDF document message"
    color: "#6366F1"

  flow MainFlow
    start: ShowPdf

    on ShowPdf
      match @reply.text
        :default -> ShowPdf

  messages Messages
    media ShowPdf <url https://rcsmaker.com/assets/rbm_and_verified_sms.pdf>
end`,
	},
	{
		name: 'Video Message',
		description: 'Simple video message',
		category: 'media',
		code: `agent MediaVideoDemo
  displayName: "Media Demo"
  start: MainFlow

  config
    description: "Simple video message"
    color: "#6366F1"

  flow MainFlow
    start: ShowVideo

    on ShowVideo
      match @reply.text
        :default -> ShowVideo

  messages Messages
    media ShowVideo <url https://rcsmaker.com/assets/sample_video_720x480_2mb.mp4>
end`,
	},
	{
		name: 'OTP Authentication',
		description: 'One-time password authentication message',
		category: 'otp',
		code: `agent OtpDemo
  displayName: "Authentication"
  start: MainFlow

  config
    description: "OTP authentication message"
    color: "#10B981"

  flow MainFlow
    start: SendOtp

    on SendOtp
      match @reply.text
        :default -> SendOtp

  messages Messages
    text SendOtp "Your code is 123456 M8tue43FGT."
      traffic: :authentication
end`,
	},
	{
		name: 'Webview',
		description: 'Rich card with webview action suggestions in different sizes',
		category: 'webview',
		code: `agent WebviewDemo
  displayName: "Nike Store"
  start: MainFlow

  config
    description: "Rich card with webview action suggestions"
    logoUri: <url https://logo.clearbit.com/nike.com>
    color: "#111111"

  flow MainFlow
    start: ProductCard

    on ProductCard
      match @reply.text
        :default -> ProductCard

  messages Messages
    richCard ProductCard "Nike Vomero 18" :tall
      description: "Maximum cushioning in the Vomero provides a comfortable ride for everyday runs. Our softest, most cushioned ride has lightweight ZoomX foam stacked on top of responsive ReactX foam in the midsole."
      media: <url https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/4d677534-954f-483e-a765-5bcb76775cb2/NIKE+VOMERO+18+%28GS%29.png>
      orientation: :vertical
      thumbnailAlignment: :left
      suggestions
        action <webview https://nike.com/new_arrivals :half> "Open webview (half)"
          postback: "new_arrivals"
          description: "View new arrivals"
          fallback: <url https://nike.com/new_arrivals>
        action <webview https://nike.com/new_arrivals :tall> "Open webview (tall)"
          postback: "new_arrivals"
          description: "View new arrivals"
          fallback: <url https://nike.com/new_arrivals>
        action <webview https://nike.com/new_arrivals :full> "Open webview (full)"
          postback: "new_arrivals"
          description: "View new arrivals"
          fallback: <url https://nike.com/new_arrivals>
end`,
	},
];

export function getExamplesByCategory(category: Example['category']): Example[] {
	return examples.filter((ex) => ex.category === category);
}

export function getExampleByName(name: string): Example | undefined {
	return examples.find((ex) => ex.name === name);
}

export function getMakerExamplesByCategory(category: Example['category']): Example[] {
	return makerExamples.filter((ex) => ex.category === category);
}

export function getMakerExampleByName(name: string): Example | undefined {
	return makerExamples.find((ex) => ex.name === name);
}

export function getAllExamples(): Example[] {
	return [...examples, ...makerExamples];
}

export function getExampleFromAnySource(name: string): Example | undefined {
	return getExampleByName(name) || getMakerExampleByName(name);
}
