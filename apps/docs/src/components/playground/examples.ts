export interface Example {
	name: string;
	description: string;
	code: string;
	category: 'basic' | 'flows' | 'messages' | 'full';
}

export const examples: Example[] = [
	{
		name: 'Hello World',
		description: 'Minimal RCL agent with a simple greeting',
		category: 'basic',
		code: `agent HelloAgent
  displayName: "Hello"

  flow MainFlow
    :start -> Greeting
    Greeting -> :end
  end

  messages Messages
    text Greeting "Hello! Welcome to RCL."
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
        :default -> set @userName: @reply.text -> Greeting

    on Greeting
      match @reply.text
        "Continue" -> AskFavorite
        "Restart" -> AskName

    on AskFavorite
      match @reply.text
        :default -> set @favorite: @reply.text -> ShowInfo

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
        :default -> set @name: @reply.text -> AskAge

    on AskAge
      match @reply.text
        :default -> set @age: @reply.text -> :end

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
        "Espresso" -> set @drink: "espresso" -> Customize
        "Latte" -> set @drink: "latte" -> Customize
        :default -> InvalidDrink

    on InvalidDrink
      -> ChooseDrink

    on Customize
      match @reply.text
        "Regular" -> set @milk: "regular" -> ChooseSize
        "Soy" -> set @milk: "soy" -> ChooseSize
        :default -> InvalidMilk

    on InvalidMilk
      -> Customize

    on ChooseSize
      match @reply.text
        "Small" -> set @size: "small", @price: <money 3.50> -> :end
        "Large" -> set @size: "large", @price: <money 5.50> -> :end
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

export function getExamplesByCategory(category: Example['category']): Example[] {
	return examples.filter((ex) => ex.category === category);
}

export function getExampleByName(name: string): Example | undefined {
	return examples.find((ex) => ex.name === name);
}
