
import g4f
import time

def test_model_auto(model_name):
    print(f"Testing model (Auto): {model_name}")
    try:
        # Let g4f decide
        response = g4f.ChatCompletion.create(
            model=model_name,
            messages=[{"role": "user", "content": "Hello"}],
            stream=False
        )
        print(f"Success! Response: {response[:100]}...")
    except Exception as e:
        print(f"Failed! Error: {e}")

if __name__ == "__main__":
    test_model_auto("gpt-3.5-turbo")
    test_model_auto("qwen")

