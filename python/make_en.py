def main():
  with open("python/pageviews.csv") as views:
    with open("python/pageviews_en.csv", "w") as out:
      for line in views:
        line = line.split(" ")
        title = line[1]
        if (line[0] != "en.wikipedia" or title == "-"): 
          continue
        else:
          out.write(" ".join(line))

if (__name__ == "__main__"):
  main()
