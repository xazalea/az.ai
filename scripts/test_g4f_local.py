
import g4f
import time
import sys

def test_model(model_name):
    print(f"Testing model: {model_name}")
    start_time = time.time()
    try:
        # Try to get the specific provider just like the API does
        from g4f.Provider import ProviderUtils
        provider = ProviderUtils.convert.get(model_name)
        
        print(f"Mapped Provider: {provider.__name__ if provider else 'None (Defaulting to Blackbox)'}")
        
        if not provider:
            provider = g4f.Provider.Blackbox

        response = g4f.ChatCompletion.create(
            model=model_name,
            messages=[{"role": "user", "content": "Hello, say this is a test."}],
            provider=provider,
            stream=False
        )
        end_time = time.time()
        print(f"Success! Time taken: {end_time - start_time:.2f}s")
        print(f"Response: {response[:100]}...")
    except Exception as e:
        print(f"Failed! Error: {e}")

if __name__ == "__main__":
    # Test a few common models
    test_model("gpt-3.5-turbo")
    test_model("gpt-4")
    test_model("qwen")

