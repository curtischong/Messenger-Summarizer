# Messenger-Summarizer
Written by [Flora Sun](https://github.com/florasun01) and [Curtis Chong](https://github.com/curtischong).

<p align="center">
  <img src="demo.png" alt="A photo of the proposed locations."/>
</p>

Messenger Summarizer is a Chrome extension that identifies and highlights important conversations, assesses sincerity, variety, length, and quality in Messenger messages.


### Features
 - Highlights the most important message in each time stamped conversation.
 - Users can click on the summarized messages and be directed to the message itself.
 - A word cloud showing all the important words and key themes in each conversation so that users can quickly conclude what they missed.
 - A red tint at each message to determine the amount of focus for each conversation. The redder the conversation, the less focused it was. This is to help users intuitively identify the most productive conversations.


### Installation

Note: This script also relies on the server which can be found [here](https://github.com/curtischong/Messenger-Summarizer-Server).

First, you'll need to install the dependencies. You can do this by downloading the js dependency files from CDNs using `cURL`.
```
curl https://code.jquery.com/jquery-3.3.1.min.js > dependencies/jquery-3.3.1.min.js &&
curl https://cdn.anychart.com/releases/8.7.0/js/anychart-tag-cloud.min.js > dependencies/anychart-tag-cloud.min.js
```

Since Chrome has some issues reading minified scripts (particularly the Anychart one), we have one more dependency to install. This involves unminifying the Anychart dependency.

To do this, go to:
https://cdn.anychart.com/releases/8.7.0/js/anychart-base.min.js
Copy and paste all the code into https://unminify.com/
Then paste the output into the [`dependencies/anychart-base.js`](dependencies/anychart-base.js)
Save the file and you'll have installed all dependencies :)

Now we will load the chrome extension into your browser by following the advice on [Thoughbot](https://thoughtbot.com/blog/how-to-make-a-chrome-extension#load-your-extension-into-chrome):

> To load your extension in Chrome, open up chrome://extensions/ in your browser and click “Developer mode” in the top right. Now click “Load unpacked extension…” and select the extension’s directory. You should now see your extension in the list. <br>
> When you change or add code in your extension, just come back to this page and reload the page. Chrome will reload your extension.


### How we determine the most important message
Let's look at how this message has a score of 14.
```
1   2    0  5   0  7 = 15
We need to rent a car
```

The first step is the create a frequency dictionary that counts how often each word appears in a conversation. In this example, "need" appears twice in the convo, so it has a score of 2. "Car" appears 7 times in the convo so it has a score of 7. To get the score of the message, we simply sum the frequencies of all the words in the sentence. Words that are used extremely frequently in English (such as "to", and "a") usually don't provide any extra value to the context of the conversation (in this naïve approach). Thus, we remove these ["stop words"](https://en.wikipedia.org/wiki/Stop_words) from the score calculation because they will inflate scores.

### How we calculate the focus of the conversation
To calculate the focus of a conversation, each word is represented as a word embedding. An embedding is a 300-dimensional vector that represents the word. You can read more about how an embedding represents a word [here](https://towardsdatascience.com/introduction-to-word-embedding-and-word2vec-652d0c2060fa). Since each dimension of the vector represents an attribute of the word, words that have different meanings from each other should be further in the vector space. In other words, if two words represent completely different concepts, then their embeddings would not be close to each other. Let's look at this two-dimensional vector to illustrate.
```
juggle         rat              cat
[0.1, 0.6]     [-0.9, -0.4]     [-0.8, -0.2]
```

The first dimension of "juggle" has a sizable difference in magnitude compared to the first dimension of the word "rat". However, the word "rat" has a smaller difference in magnitude to the first dimension of the word "cat". This is because "rat" represents a concept that is closer to "cat" than to "juggle".

We also apply the word embeddings concept to determine how focused each message is. We assume that off-topic messages would have a collection of vector spaces that are further apart in each dimension, and therefore greater variance than related conversations. To determine the amount of focus each conversation has, we simply calculate the variance across all of the words in a message. This final variance score is what tints the messages red!

Note: To simplify the calculation of the distances between each word vector, we naïvely disregard the vector space that the embeddings were trained on.

### How the word cloud is populated
We use a custom weighting scheme that is based on:
- Its frequency in the entire conversation.
- The length of the word.
- Its classification as slang.
- Its classification as a greeting.
